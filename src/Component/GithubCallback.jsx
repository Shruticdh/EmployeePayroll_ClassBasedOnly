import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const GitHubCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_GITHUB_CLIENT_SECRET;
  const redirectUri = import.meta.env.VITE_GITHUB_REDIRECT_URI;

console.log(clientId, clientSecret, redirectUri);

  useEffect(() => {
    const fetchGitHubUser = async () => {
      const code = new URLSearchParams(location.search).get('code');

      if (!code) {
        setError('No code found');
        setLoading(false);
        return;
      }

      try {
        const tokenUrl = `https://cors-anywhere.herokuapp.com/https://github.com/login/oauth/access_token`;

        const response = await fetch(tokenUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            client_id: clientId,
            client_secret: clientSecret,
            code,
            redirect_uri: redirectUri
          })
        });

        const tokenData = await response.json();
        const accessToken = tokenData.access_token;
        console.log("GitHub Access Token:", accessToken);

        if (!accessToken) {
          setError('Access token not received.');
          setLoading(false);
          return;
        }

        const authHeaders = {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github+json'
        };

        const userResponse = await fetch('https://api.github.com/user', {
          headers: authHeaders
        });

        const userData = await userResponse.json();
        console.log("GitHub User:", userData);

        const emailResponse = await fetch('https://api.github.com/user/emails', {
          headers: authHeaders
        });

        const emails = await emailResponse.json();
        console.log('GitHub Emails Response:', emails);

        const primaryEmail = emails.find(email => email.primary)?.email || emails[0]?.email;

        const userInfo = {
          name: userData.name || userData.login,
          email: primaryEmail
        };

        console.log('User Info:', userInfo);

        localStorage.setItem('userName', JSON.stringify(userInfo));
        localStorage.setItem('credential', accessToken);
        localStorage.setItem('authProvider', 'github');

        navigate('/dashboard');

      } catch (err) {
        setError('GitHub login failed: ' + err.message);
        setLoading(false);
      }
    };

    fetchGitHubUser();
  }, [location, navigate, clientId, clientSecret, redirectUri]);

  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      {loading ? (
        <h2>Authenticating with GitHub...</h2>
      ) : (
        <div>
          <p style={{ color: 'red' }}>{error}</p>
          <button onClick={() => navigate('/')}>Back to Login</button>
        </div>
      )}
    </div>
  );
};

export default GitHubCallback;
