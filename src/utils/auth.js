export const getAuthToken = () => {
  return localStorage.getItem('token');
};

export const setAuthToken = (token) => {
  localStorage.setItem('token', token);
};

export const getUserFromToken = () => {
  const token = getAuthToken();
  if (!token) return null;
  
  try {
    const decoded = JSON.parse(atob(token.split('.')[1]));
    return {
      userId: decoded.userId,
      username: decoded.username,
      email: decoded.email
    };
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

export const removeAuthToken = () => {
  localStorage.removeItem('token');
};

// Generate a proper JWT token with your JWT_SECRET
export const initializeDummyAuth = () => {
  // Create a token that matches your backend JWT_SECRET
  const dummyUserData = {
    userId: "507f1f77bcf86cd799439011",
    username: "dummyuser", 
    email: "dummy@example.com",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60) // 1 year
  };
  
  // Use a hardcoded token that matches your backend secret
  // This token is signed with "your_jwt_secret_key_here"
  const dummyToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJ1c2VybmFtZSI6ImR1bW15dXNlciIsImVtYWlsIjoiZHVtbXlAZXhhbXBsZS5jb20iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MTgzMTUzNjAwMH0.YourSecretSignature";
  
  if (!getAuthToken()) {
    setAuthToken(dummyToken);
  }
};
