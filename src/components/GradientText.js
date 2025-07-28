import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const GradientText = styled(Typography)`
  background: linear-gradient(45deg, #FF6B6B 30%, #4ECDC4 90%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-family: 'Pacifico', cursive;
  font-size: 3rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
  @media (max-width: 600px) {
    font-size: 2rem;
  }
`;

export default GradientText;
