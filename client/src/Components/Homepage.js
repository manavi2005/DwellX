import React from 'react';
//import Navbar from './Navbar';
import './Homepage.css';
import { Link } from 'react-router-dom';

const Homepage = () => {
  const isAuth = !!localStorage.getItem('dwellx_token');

  return (
    <div className="homepage">
      {/* <Navbar /> */}
      
      <section className="hero-section">
        <div className="hero-content">
          <h1 className='title-h1'>Find Your Ideal Chicago Neighborhood</h1>
          <p>DwellX helps newcomers discover the perfect district based on what matters most to you</p>
          <div className="hero-buttons">


          {isAuth ? (
              <Link to="/generate">
                <button className="primary-btn">Get Started</button>
              </Link>
            ) : (
              <Link to="/login">
                <button className="primary-btn">Get Started</button>
              </Link>
          )}





            <Link to="/explore">
              <button className="secondary-btn">Explore Districts</button>
            </Link>
          </div>
        </div>
      </section>
      
      <section className="features-section">
        <h2>What Makes DwellX Different</h2>
        <div className="features-container">
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Data-Driven Insights</h3>
            <p>Real-time statistics from official Chicago data sources, no predictions, just facts</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Personalized Rankings</h3>
            <p>Prioritize what matters to you and get customized district recommendations</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h3>Community Forum</h3>
            <p>Learn from residents' experiences and share your own insights</p>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <h2>How DwellX Works</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Create Your Profile</h3>
            <p>Sign up and tell us what factors matter most for your ideal neighborhood</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Set Your Preferences</h3>
            <p>Rank the importance of schools, safety, housing costs, and more</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Get Personalized Results</h3>
            <p>Receive district recommendations tailored to your specific needs</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Compare & Save</h3>
            <p>Save your favorite districts and compare them side by side</p>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Find Your Perfect Chicago Neighborhood?</h2>
          <p>Join DwellX today and make your relocation decision with confidence.</p>


          {isAuth ? (
              <Link to="/generate">
                <button className="primary-btn">Get Started</button>
              </Link>
            ) : (
              <Link to="/login">
                <button className="primary-btn">Get Started</button>
              </Link>
          )}


        </div>
      </section>
      
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">
            <h2>DwellX</h2>
            <p>Making relocation decisions easier</p>
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h3>Explore</h3>
              <ul>
                <li><a href="/">Districts</a></li>
                <li><a href="/">Metrics</a></li>
                <li><a href="/">Map</a></li>
                <li><a href="/">Community</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h3>About</h3>
              <ul>
                <li><a href="/">Our Mission</a></li>
                <li><a href="/">Data Sources</a></li>
                <li><a href="/">How It Works</a></li>
                <li><a href="/">Contact Us</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h3>Legal</h3>
              <ul>
                <li><a href="/">Terms of Service</a></li>
                <li><a href="/">Privacy Policy</a></li>
                <li><a href="/">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 DwellX. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;