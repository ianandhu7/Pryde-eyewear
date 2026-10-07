import Link from "next/link";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.grid}>

        {/* Col 1 — Brand */}
        <div className={styles.brandCol}>
          <Link href="/" className={styles.logo}>PRYDE</Link>
          <p className={styles.brandDesc}>
            Premium eyewear brand crafting optical frames and sunglasses with
            precision-engineered Japanese acetate and Italian craftsmanship.
          </p>
          <div className={styles.badges}>
            <span className={styles.badge}>OPTICAL</span>
            <span className={styles.badge}>SUNGLASSES</span>
          </div>
        </div>

        {/* Col 2 — Navigation */}
        <div className={styles.col}>
          <h3 className={styles.colTitle}>NAVIGATION</h3>
          <ul className={styles.linkList}>
            <li><Link href="/">Home</Link></li>
            <li><Link href="/collections/optical">Optical Frames</Link></li>
            <li><Link href="/collections/sunglasses">Sunglasses</Link></li>
            <li><Link href="/collections">Collections</Link></li>
            <li><Link href="/about">Our Story</Link></li>
          </ul>
        </div>

        {/* Col 3 — Showroom Hours */}
        <div className={styles.col}>
          <h3 className={styles.colTitle}>SHOWROOM HOURS</h3>
          <ul className={styles.hoursList}>
            <li>
              <span className={styles.day}>Mon – Sat</span>
              <span className={styles.time}>10:30 AM – 9:00 PM</span>
            </li>
            <li>
              <span className={styles.day}>Sunday</span>
              <span className={styles.time}>11:00 AM – 8:30 PM</span>
            </li>
          </ul>
        </div>

        {/* Col 4 — Store Location */}
        <div className={styles.col}>
          <h3 className={styles.colTitle}>STORE LOCATION</h3>
          <div className={styles.storeInfo}>
            <p className={styles.storeName}>📍 PRYDE Eyewear</p>
            <p className={styles.storeDetail}>9/9, 59th Cross Rd,</p>
            <p className={styles.storeDetail}>Near Bhasyam Circle,</p>
            <p className={styles.storeDetail}>Rajajinagar, Bengaluru,</p>
            <p className={styles.storeDetail}>Karnataka – 560010</p>
            <a
              href="https://www.google.com/maps/search/9%2F9+59th+Cross+Rd+Bhasyam+circle+Rajajinagar+Bengaluru+Karnataka+560010"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.mapsBtn}
            >
              📍 Open in Google Maps
            </a>
          </div>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className={styles.bottomBar}>
        <span className={styles.copy}>
          © {new Date().getFullYear()} PRYDE EYEWEAR. Premium optical frames &amp; sunglasses.
        </span>
      </div>
    </footer>
  );
}
