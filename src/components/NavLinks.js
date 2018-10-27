import React from 'react';
import { Link } from 'react-router-dom';
import Info from '@material-ui/icons/Info';
import Home from '@material-ui/icons/Home';

/** Navigation links used in TopNav */
const NavLinks = () => (
  <div style={{ display: 'flex', alignContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
    <Link to={{ pathname: `/about` }}>
      <Info style={{ color: '#fff', paddingRight: '.5em', fontSize: '1.75em' }} />
    </Link>
    <Link to={{ pathname: `/` }}>
      <Home style={{ color: '#fff', paddingRight: '.5em', fontSize: '1.75em' }} />
    </Link>
  </div>
);

export default NavLinks;
