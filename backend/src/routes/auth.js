// backend/src/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const transporter = require('../utils/mailer');
const { User, Sector } = require('../models');

// Aviso se não tiver secret definido
if (!process.env.JWT_SECRET) {
  console.warn('⚠️ JWT_SECRET não está definido. O login pode falhar por isso.');
}

// helper para normalizar e-mail
const normalizeEmail = email => (email || '').trim().toLowerCase();

// 1) Registro com código por e-mail (reenvia se não verificado)
router.post('/register', async (req, res) => {
  console.log('REGISTER BODY:', req.body);
  let { email, password, sectorId } = req.body;
  email = normalizeEmail(email);

  if (!email || !password || !sectorId) {
    return res.status(400).json({ message: 'Email, senha e setor são obrigatórios.' });
  }

  try {
    const sector = await Sector.findByPk(sectorId);
    if (!sector) {
      return res.status(400).json({ message: 'Setor inválido.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 3600000; // 1 hora

    const existing = await User.findOne({ where: { email } });

    if (existing) {
      if (existing.emailVerified) {
        // já cadastrado e verificado
        return res.status(409).json({ message: 'Este e-mail já está cadastrado.' });
      } else {
        // reenvia código: atualiza dados do usuário existente
        existing.password = hashed; // aplica nova senha
        existing.setor = sector.name;
        existing.sectorId = sector.id;
        existing.verificationToken = code;
        existing.verificationTokenExpires = expires;
        await existing.save();

        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Seu código de verificação (reenvio)',
          html: `<p>Seu código de verificação é <b>${code}</b>. Expira em 1 hora.</p>`
        });

        return res.status(200).json({ message: 'Código de verificação reenviado por e-mail.' });
      }
    }

    // criação normal
    await User.create({
      email,
      password: hashed,
      setor: sector.name, // legado
      sectorId: sector.id,
      verificationToken: code,
      verificationTokenExpires: expires
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Seu código de verificação',
      html: `<p>Seu código de verificação é <b>${code}</b>. Expira em 1 hora.</p>`
    });

    return res.status(201).json({ message: 'Código de verificação enviado por e-mail.' });
  } catch (err) {
    console.error('ERROR REGISTER:', err);
    return res.status(500).json({ message: 'Erro interno ao registrar usuário.' });
  }
});

// 2) Verificação de código de registro
router.post('/verify-email', async (req, res) => {
  const { email: rawEmail, code } = req.body;
  const email = normalizeEmail(rawEmail);
  if (!email || !code) {
    return res.status(400).json({ message: 'Email e código são obrigatórios.' });
  }
  try {
    const user = await User.findOne({ where: { email, verificationToken: code } });
    if (!user) {
      return res.status(400).json({ message: 'Código inválido.' });
    }
    if (user.verificationTokenExpires < Date.now()) {
      return res.status(400).json({ message: 'Código expirado.' });
    }
    user.emailVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;
    await user.save();

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET não definido. Não é possível gerar token.');
      return res.status(500).json({ message: 'Erro de configuração no servidor.' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    return res.json({ token });
  } catch (err) {
    console.error('ERROR VERIFY EMAIL:', err);
    return res.status(500).json({ message: 'Erro interno ao verificar e-mail.' });
  }
});

// 3) Login
router.post('/login', async (req, res) => {
  let { email: rawEmail, password } = req.body;
  const email = normalizeEmail(rawEmail);
  if (!email || !password) {
    return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: 'Usuário não encontrado.' });
    if (!user.emailVerified) return res.status(400).json({ message: 'Verifique seu e-mail antes de entrar.' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Senha incorreta.' });

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET não definido. Não é possível gerar token.');
      return res.status(500).json({ message: 'Erro de configuração no servidor.' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    return res.json({ token });
  } catch (err) {
    console.error('ERROR LOGIN:', err);
    return res.status(500).json({ message: 'Erro interno no login.' });
  }
});

// 4) Enviar código de recuperação de senha
router.post('/forgot-password', async (req, res) => {
  const { email: rawEmail } = req.body;
  const email = normalizeEmail(rawEmail);
  if (!email) return res.status(400).json({ message: 'Email é obrigatório.' });
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(200).json({ message: 'Se existir, você receberá um e-mail.' });
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordToken = code;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Código para redefinição de senha',
      html: `<p>Seu código de redefinição é <b>${code}</b>. Expira em 1 hora.</p>`
    });
    return res.json({ message: 'Se existir, você receberá um e-mail.' });
  } catch (err) {
    console.error('ERROR FORGOT PASSWORD:', err);
    return res.status(500).json({ message: 'Erro interno ao requisitar redefinição.' });
  }
});

router.post('/reset-password', async (req, res) => {
  const { email: rawEmail, code, newPassword } = req.body;
  const email = normalizeEmail(rawEmail);
  if (!email || !code || !newPassword) {
    return res.status(400).json({ message: 'Email, código e nova senha são obrigatórios.' });
  }
  try {
    const user = await User.findOne({ where: { email, resetPasswordToken: code } });
    if (!user || user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({ message: 'Código inválido ou expirado.' });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();
    return res.json({ message: 'Senha redefinida com sucesso!' });
  } catch (err) {
    console.error('ERROR RESET PASSWORD:', err);
    return res.status(500).json({ message: 'Erro interno ao redefinir senha.' });
  }
});

module.exports = router;
