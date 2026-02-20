

import React from 'react';
import styles from '../styles/Footer.module.css';
import {
  FiFacebook,
  FiTwitter,
  FiInstagram,
  FiLinkedin,
  FiMail,
  FiPhone,
  FiMapPin
} from 'react-icons/fi';
import { useTranslation } from "react-i18next";

const Footer = () => {

  const { t } = useTranslation();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>

        <div className={styles.footerMain}>

          {/* Brand Info */}
          <div className={styles.brandInfo}>
            <div className={styles.logo}>e<span>Mart</span></div>

            <p className={styles.description}>
              {t("footer.description")}
            </p>

            <div className={styles.socialLinks}>
              <a href="#" className={styles.socialIcon}><FiFacebook /></a>
              <a href="#" className={styles.socialIcon}><FiTwitter /></a>
              <a href="#" className={styles.socialIcon}><FiInstagram /></a>
              <a href="#" className={styles.socialIcon}><FiLinkedin /></a>
            </div>
          </div>

          {/* Links */}
          <div className={styles.linksGrid}>

            {/* Shop */}
            <div className={styles.linkColumn}>
              <h4>{t("footer.shop")}</h4>
              <a href="/browse/C001">{t("footer.electronics")}</a>
              <a href="/browse/C002">{t("footer.fashion")}</a>
              <a href="/browse/C003">{t("footer.homeAppliances")}</a>
              <a href="/browse/C005">{t("footer.sports")}</a>
            </div>

            {/* Support */}
            <div className={styles.linkColumn}>
              <h4>{t("footer.support")}</h4>
              <a href="#">{t("footer.helpCenter")}</a>
              <a href="#">{t("footer.trackOrder")}</a>
              <a href="#">{t("footer.returns")}</a>
              <a href="#">{t("footer.shippingInfo")}</a>
            </div>

            {/* Company */}
            <div className={styles.linkColumn}>
              <h4>{t("footer.company")}</h4>
              <a href="#">{t("footer.aboutUs")}</a>
              <a href="#">{t("footer.careers")}</a>
              <a href="#">{t("footer.privacyPolicy")}</a>
              <a href="#">{t("footer.terms")}</a>
            </div>

            {/* Contact */}
            <div className={styles.linkColumn}>
              <h4>{t("footer.contact")}</h4>
              <div className={styles.contactItem}>
                <FiMapPin /> {t("footer.address")}
              </div>
              <div className={styles.contactItem}>
                <FiPhone /> +1 234 567 890
              </div>
              <div className={styles.contactItem}>
                <FiMail /> support@emart.com
              </div>
            </div>

          </div>
        </div>

        {/* Bottom */}
        <div className={styles.footerBottom}>
          <p>{t("footer.copyright")}</p>

          <div className={styles.footerBottomLinks}>
            <a href="#">{t("footer.sitemap")}</a>
            <a href="#">{t("footer.cookies")}</a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
