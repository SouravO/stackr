import { Router } from 'express';
import { supabase, supabaseAdmin } from '../supabase.js';
import { otpStore } from '../otpStore.js';
import { sendOtpEmail } from '../email.js';

const router = Router();

router.post('/signup', async (req, res, next) => {
  try {
    const { email, password, name, phone } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const otp = otpStore.set(email, { password, name, phone });

    await sendOtpEmail({ to: email, otp, name });

    res.status(201).json({ message: 'OTP sent to email' });
  } catch (err) {
    next(err);
  }
});

router.post('/verify', async (req, res, next) => {
  try {
    const { email, token } = req.body;

    if (!email || !token) {
      return res.status(400).json({ error: 'Email and token are required' });
    }

    const entry = otpStore.get(email);
    if (!entry) {
      return res.status(400).json({ error: 'OTP expired or not found. Request a new one.' });
    }

    if (entry.otp !== token) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    otpStore.remove(email);

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: entry.password,
      email_confirm: true,
      user_metadata: { name: entry.name, phone: entry.phone, role: 'NORMAL_USER' },
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({
      message: 'User created successfully',
      user: data.user,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/resend', async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const existing = otpStore.get(email);
    if (!existing) {
      return res.status(400).json({ error: 'No OTP request found. Please sign up first.' });
    }

    const otp = otpStore.set(email, {
      password: existing.password,
      name: existing.name,
      phone: existing.phone,
    });

    await sendOtpEmail({ to: email, otp, name: existing.name });

    res.json({ message: 'OTP resent to email' });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    res.json({
      message: 'Login successful',
      session: data.session,
      user: data.user,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
