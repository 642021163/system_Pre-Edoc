import React from 'react'
import { Box, TextField, Button } from '@mui/material';

function UserLogin() {
  return (
    <div>
           <Box component="form" sx={{ width: '100%', mt: 2 }}>
      <TextField
        fullWidth
        label="Username"
        variant="outlined"
        margin="normal"
      />
      <TextField
        fullWidth
        label="Password"
        type="password"
        variant="outlined"
        margin="normal"
      />
      <Button variant="contained" color="primary" sx={{ mt: 2 }}>
        Login as User
      </Button>
    </Box>
    </div>
  )
}

export default UserLogin
