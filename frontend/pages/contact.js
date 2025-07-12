import React, { useState } from 'react';
import Head from 'next/head';
import NextLink from 'next/link';
import {
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Alert,
  Snackbar,
  Fab
} from '@mui/material';
import {
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  WhatsApp as WhatsAppIcon,
  Instagram as InstagramIcon,
  Twitter as TwitterIcon,
  Facebook as FacebookIcon,
  Send as SendIcon,
  KeyboardArrowUp as ArrowUpIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Burada form gönderme işlemi yapılacak
      // Şimdilik simüle ediyoruz
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSnackbar({
        open: true,
        message: 'Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.',
        severity: 'success'
      });
      
      // Formu temizle
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Mesaj gönderilirken bir hata oluştu. Lütfen tekrar deneyin.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const contactInfo = [
    {
      icon: <PhoneIcon className="text-gold-500" />,
      title: 'Telefon',
      info: '+90 (212) 123 45 67',
      link: 'tel:+902121234567'
    },
    {
      icon: <WhatsAppIcon className="text-green-500" />,
      title: 'WhatsApp',
      info: '+90 (532) 123 45 67',
      link: 'https://wa.me/905321234567'
    },
    {
      icon: <EmailIcon className="text-blue-500" />,
      title: 'E-posta',
      info: 'info@stepgoldenshoes.com',
      link: 'mailto:info@stepgoldenshoes.com'
    },
    {
      icon: <LocationIcon className="text-red-500" />,
      title: 'Adres',
      info: 'Levent, Büyükdere Cad. No:123, 34394 Şişli/İstanbul',
      link: 'https://maps.google.com'
    }
  ];

  const socialMedia = [
    {
      icon: <InstagramIcon className="text-pink-500" />,
      name: 'Instagram',
      link: 'https://instagram.com/stepgoldenshoes'
    },
    {
      icon: <FacebookIcon className="text-blue-600" />,
      name: 'Facebook',
      link: 'https://facebook.com/stepgoldenshoes'
    },
    {
      icon: <TwitterIcon className="text-blue-400" />,
      name: 'Twitter',
      link: 'https://twitter.com/stepgoldenshoes'
    }
  ];

  return (
    <>
      <Head>
        <title>İletişim - STEP Golden Shoes</title>
        <meta name="description" content="STEP Golden Shoes ile iletişime geçin. Sorularınız için bize ulaşın." />
      </Head>

      <div className="min-h-screen bg-black pt-12">
        {/* Header */}
        <div className="bg-dark-950 py-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center mb-6">
              <NextLink href="/">
                <button className="flex items-center text-gold-500 hover:text-gold-400 transition-colors mr-4">
                  <ArrowBackIcon className="w-5 h-5 mr-2" />
                  Ana Sayfa
                </button>
              </NextLink>
            </div>
            
            <h1 className="luxury-title text-3xl mb-4">
              İletişim
            </h1>
            <p className="text-gray-400 text-lg">
              Size nasıl yardımcı olabiliriz?
            </p>
          </div>
        </div>

        {/* Contact Info Cards */}
        <div className="py-12 bg-dark-950">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {contactInfo.map((contact, index) => (
                <div
                  key={index}
                  className="product-card text-center p-6 animate-fadeInUp"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="text-4xl mb-4 flex justify-center">
                    {contact.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {contact.title}
                  </h3>
                  <a
                    href={contact.link}
                    target={contact.link.startsWith('http') ? '_blank' : undefined}
                    rel={contact.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="text-gray-400 hover:text-gold-500 transition-colors text-sm"
                  >
                    {contact.info}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Form & Map */}
        <div className="py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div className="animate-fadeInUp">
                <h2 className="text-2xl font-luxury text-gold-500 mb-6">
                  Bize Mesaj Gönderin
                </h2>
                <div className="product-card p-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        name="name"
                        placeholder="Adınız Soyadınız"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-dark-800 border border-dark-600 rounded-lg py-3 px-4 text-white placeholder-gray-400 focus:border-gold-500 focus:outline-none"
                      />
                      <input
                        type="email"
                        name="email"
                        placeholder="E-posta Adresiniz"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-dark-800 border border-dark-600 rounded-lg py-3 px-4 text-white placeholder-gray-400 focus:border-gold-500 focus:outline-none"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="tel"
                        name="phone"
                        placeholder="Telefon Numaranız"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full bg-dark-800 border border-dark-600 rounded-lg py-3 px-4 text-white placeholder-gray-400 focus:border-gold-500 focus:outline-none"
                      />
                      <input
                        type="text"
                        name="subject"
                        placeholder="Konu"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-dark-800 border border-dark-600 rounded-lg py-3 px-4 text-white placeholder-gray-400 focus:border-gold-500 focus:outline-none"
                      />
                    </div>

                    <textarea
                      name="message"
                      placeholder="Mesajınız"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full bg-dark-800 border border-dark-600 rounded-lg py-3 px-4 text-white placeholder-gray-400 focus:border-gold-500 focus:outline-none resize-none"
                    />

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full btn-gold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                          <span>Gönderiliyor...</span>
                        </>
                      ) : (
                        <>
                          <SendIcon className="w-4 h-4" />
                          <span>Mesajı Gönder</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>

              {/* Map & Additional Info */}
              <div className="animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                <h2 className="text-2xl font-luxury text-gold-500 mb-6">
                  Bizi Ziyaret Edin
                </h2>
                
                {/* Map Placeholder */}
                <div className="product-card p-6 mb-6">
                  <div className="bg-dark-800 rounded-lg h-64 flex items-center justify-center">
                    <div className="text-center">
                      <LocationIcon className="text-gold-500 w-12 h-12 mx-auto mb-4" />
                      <p className="text-gray-400">
                        Levent, Büyükdere Cad. No:123
                        <br />
                        34394 Şişli/İstanbul
                      </p>
                    </div>
                  </div>
                </div>

                {/* Working Hours */}
                <div className="product-card p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gold-500 mb-4">
                    Çalışma Saatleri
                  </h3>
                  <div className="space-y-2 text-gray-400">
                    <div className="flex justify-between">
                      <span>Pazartesi - Cumartesi</span>
                      <span>09:00 - 21:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pazar</span>
                      <span>10:00 - 20:00</span>
                    </div>
                  </div>
                </div>

                {/* Social Media */}
                <div className="product-card p-6">
                  <h3 className="text-lg font-semibold text-gold-500 mb-4">
                    Sosyal Medya
                  </h3>
                  <div className="flex space-x-4">
                    {socialMedia.map((social, index) => (
                      <a
                        key={index}
                        href={social.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 bg-dark-800 rounded-full flex items-center justify-center hover:bg-dark-700 transition-colors"
                      >
                        {social.icon}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Contact */}
        <div className="py-12 bg-dark-950">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-2xl font-luxury text-gold-500 mb-4">
              Hızlı İletişim
            </h2>
            <p className="text-gray-400 mb-8">
              Acil durumlar için WhatsApp üzerinden 7/24 ulaşabilirsiniz
            </p>
            <a
              href="https://wa.me/905321234567"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-500 transition-colors"
            >
              <WhatsAppIcon className="w-5 h-5" />
              <span>WhatsApp ile İletişime Geç</span>
            </a>
          </div>
        </div>

        {/* Scroll to Top */}
        <Fab
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-gold-500 hover:bg-gold-400 text-black"
          size="medium"
        >
          <ArrowUpIcon />
        </Fab>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </div>
    </>
  );
} 