import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  CssBaseline,
  Collapse,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  ShoppingBag as ShoppingBagIcon,
  Category as CategoryIcon,
  People as PeopleIcon,
  BarChart as BarChartIcon,
  Settings as SettingsIcon,
  ExpandLess,
  ExpandMore,
  ExitToApp as ExitToAppIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
  { 
    text: 'E-Ticaret', 
    icon: <ShoppingBagIcon />,
    subItems: [
      { text: 'Ürünler', path: '/admin/products' },
      { text: 'Siparişler', path: '/admin/orders' },
      { text: 'Kategoriler', path: '/admin/categories' },
      { text: 'Yönetim Paneli', path: '/admin' },
    ]
  },
  { text: 'Kullanıcılar', icon: <PeopleIcon />, path: '/admin/users' },
  { text: 'Raporlar', icon: <BarChartIcon />, path: '/admin/reports' },
  { text: 'Ayarlar', icon: <SettingsIcon />, path: '/admin/settings' },
];

const AdminLayout = ({ children, pageTitle }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSubMenu, setOpenSubMenu] = useState(null);
  const { signOut } = useAuth();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSubMenuClick = (text) => {
    setOpenSubMenu(openSubMenu === text ? null : text);
  };
  
  const drawerContent = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
          Yönetim Paneli
        </Typography>
      </Toolbar>
      <List>
        {menuItems.map((item, index) => (
          <React.Fragment key={item.text}>
            {item.subItems ? (
              <>
                <ListItem button onClick={() => handleSubMenuClick(item.text)}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                  {openSubMenu === item.text ? <ExpandLess /> : <ExpandMore />}
                </ListItem>
                <Collapse in={openSubMenu === item.text} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.subItems.map((subItem) => (
                      <Link href={subItem.path} passHref legacyBehavior key={subItem.text}>
                        <ListItem button component="a" sx={{ pl: 4 }}>
                          <ListItemText primary={subItem.text} />
                        </ListItem>
                      </Link>
                    ))}
                  </List>
                </Collapse>
              </>
            ) : (
              <Link href={item.path} passHref legacyBehavior>
                <ListItem button component="a">
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItem>
              </Link>
            )}
          </React.Fragment>
        ))}
      </List>
      <Box sx={{ position: 'absolute', bottom: 0, width: '100%' }}>
        <Divider />
        <Link href="/" passHref legacyBehavior>
          <ListItem button component="a">
            <ListItemIcon><HomeIcon /></ListItemIcon>
            <ListItemText primary="Ana Sayfaya Dön" />
          </ListItem>
        </Link>
        <Divider />
        <ListItem button onClick={signOut}>
          <ListItemIcon><ExitToAppIcon /></ListItemIcon>
          <ListItemText primary="Çıkış Yap" />
        </ListItem>
      </Box>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            {pageTitle || 'Dashboard'}
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          bgcolor: '#f4f6f8',
          minHeight: '100vh'
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default AdminLayout; 