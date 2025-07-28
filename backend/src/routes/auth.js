const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const transporter = require('../utils/mailer');
const { User } = require('../models');

// Registro com envio de e-mail de verificação
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const user = await User.create({
      email, password: hashed, verificationToken
    });
    // Envia e-mail de verificação
    const link = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verifique seu e‑mail',
      html: `<p>Para ativar sua conta, clique no link abaixo:</p>
             <a href="${link}">${link}</a>`
    });
    res.json({ message: 'Conta criada! Verifique seu e‑mail.' });
  } catch (err) {
    res.status(400).json({ message: 'Erro ao registrar usuário', error: err.message });
  }
});

// Verificação de e-mail
router.get('/verify-email', async (req, res) => {
  const { token } = req.query;
  const user = await User.findOne({ where: { verificationToken: token } });
  if (!user) return res.status(400).json({ message: 'Token inválido' });
  user.emailVerified = true;
  user.verificationToken = null;
  await user.save();
  res.json({ message: 'E‑mail verificado com sucesso!' });
});

// Login só se e‑mail verificado
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(400).json({ message: 'Usuário não encontrado' });
  if (!user.emailVerified) return res.status(400).json({ message: 'Verifique seu e‑mail antes de entrar.' });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: 'Senha incorreta' });
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.json({ token });
});

// Solicitar recuperação de senha
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(200).json({ message: 'Se existir, você receberá um e‑mail.' });
  const token = crypto.randomBytes(3).toString('hex').toUpperCase(); // código de 6 dígitos
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 3600000; // 1h
  await user.save();
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Recuperar senha',
    html: `<p>Seu código de recuperação é: <b>${token}</b><p>
           <p>Expira em 1 hora.</p>`
  });
  res.json({ message: 'Código de recuperação enviado ao seu e‑mail.' });
});

// Redefinir senha
router.post('/reset-password', async (req, res) => {
  const { email, code, newPassword } = req.body;
  const user = await User.findOne({ where: { email, resetPasswordToken: code } });
  if (!user || user.resetPasswordExpires < Date.now()) {
    return res.status(400).json({ message: 'Código inválido ou expirado.' });
  }
  user.password = await bcrypt.hash(newPassword, 10);
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();
  res.json({ message: 'Senha redefinida com sucesso!' });
});

module.exports = router;
