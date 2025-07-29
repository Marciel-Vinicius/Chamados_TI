// backend/src/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const transporter = require('../utils/mailer');
const { User } = require('../models');

// 1) Registro com código por e‑mail
router.post('/register', async (req, res) => {
  console.log('REGISTER BODY:', req.body);
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
  }
  try {
    const exists = await User.findOne({ where: { email } });
    if (exists) {
      return res.status(409).json({ message: 'Este e‑mail já está cadastrado.' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 3600000; // 1 hora

    await User.create({
      email,
      password: hashed,
      verificationToken: code,
      verificationTokenExpires: expires
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Seu código de verificação',
      html: `<p>Seu código de verificação é <b>${code}</b>. Expira em 1 hora.</p>`
    });

    return res.status(201).json({ message: 'Código de verificação enviado por e‑mail.' });
  } catch (err) {
    console.error('ERROR REGISTER:', err);
    return res.status(500).json({ message: 'Erro interno ao registrar usuário.' });
  }
});

// 2) Verificação de código de registro
router.post('/verify-email', async (req, res) => {
  const { email, code } = req.body;
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
    return res.json({ message: 'E‑mail verificado com sucesso!' });
  } catch (err) {
    console.error('ERROR VERIFY EMAIL:', err);
    return res.status(500).json({ message: 'Erro interno na verificação.' });
  }
});

// 3) Login (só usuários verificados)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: 'Usuário não encontrado.' });
    if (!user.emailVerified) return res.status(400).json({ message: 'Verifique seu e‑mail antes de entrar.' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Senha incorreta.' });
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    return res.json({ token });
  } catch (err) {
    console.error('ERROR LOGIN:', err);
    return res.status(500).json({ message: 'Erro interno no login.' });
  }
});

// 4) Enviar código de recuperação de senha
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email é obrigatório.' });
  }
  try {
    const user = await User.findOne({ where: { email } });
    // respondemos 200 de qualquer forma para não vazar existência de conta
    if (!user) {
      return res.status(200).json({ message: 'Se existir, você receberá um e‑mail.' });
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordToken = code;
    user.resetPasswordExpires = Date.now() + 3600000; // 1h
    await user.save();
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Código para redefinição de senha',
      html: `<p>Seu código para redefinir a senha é <b>${code}</b>. Expira em 1 hora.</p>`
    });
    return res.json({ message: 'Código de recuperação enviado ao seu e‑mail.' });
  } catch (err) {
    console.error('ERROR FORGOT PASSWORD:', err);
    return res.status(500).json({ message: 'Erro interno ao solicitar recuperação.' });
  }
});

// 5) Redefinir senha com código
router.post('/reset-password', async (req, res) => {
  const { email, code, newPassword } = req.body;
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
