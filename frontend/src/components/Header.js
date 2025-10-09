import React from 'react';
import ot_logo_light from '../images/ot_logo_light.png';
import ot_logo_dark from '../images/ot_logo_dark.png';
import useTheme from "@mui/material/styles/useTheme";
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { userManager } from '../../api';

function Header() {
  const theme = useTheme();

  const login = async () => {
    sessionStorage.setItem('post_login_redirect', window.location.pathname);
    await userManager.signinRedirect();
  };

  const logout = async () => {
    try {
      await userManager.signoutRedirect();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between">
      <img
        src={theme.palette.mode === 'dark' ? ot_logo_dark : ot_logo_light}
        height={60}
        alt="OSINT Toolkit logo"
      />
      <Stack direction="row" spacing={1}>
        <Button variant="outlined" size="small" onClick={login}>Login</Button>
        <Button variant="contained" size="small" onClick={logout}>Logout</Button>
      </Stack>
    </Stack>
  )
}

export default Header
