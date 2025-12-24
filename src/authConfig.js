const cognitoDomain =
  "https://eu-west-2m70eghnrz.auth.eu-west-2.amazoncognito.com";

const clientId = "12og7a7gucjn8d2uus6k4b3hka";
const redirectUri = encodeURIComponent(window.location.origin + "/");

export const loginUrl =
  `${cognitoDomain}/login?` +
  `client_id=${clientId}` +
  `&response_type=code` +
  `&scope=openid+email` +
  `&redirect_uri=${redirectUri}`;


export const logoutUrl =
  `${cognitoDomain}/logout?` +
  `client_id=${clientId}` +
  `&logout_uri=${encodeURIComponent(redirectUri)}`;
