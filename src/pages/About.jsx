import React from 'react';
import Header from '../components/crucial/SiteHeader';
import Footer from '../components/crucial/SiteFooter';

const About = () => {
  return (
    <div className="flex flex-col min-h-screen bg-black">
      <Header />
         <div>
            <h1> ITS MY PRODUCT, BELIEVE ME</h1>
         </div>
      <Footer />
    </div>
  );
};

export default About;
