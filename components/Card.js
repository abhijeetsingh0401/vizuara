import Image from "next/image";
import PropTypes from "prop-types";
import Link from "next/link";

export default function Card({ icon, title, description, isNew, isFav, url }) {
  return (
    <Link href={url} style={styles.link}>
      <div style={styles.card}>
        <div style={styles.iconContainer}>
          <Image src={icon} alt="Icon" width={50} height={50} />
        </div>
        <div style={styles.contentContainer}>
          <div style={styles.titleContainer}>
            <h2 style={styles.title}>{title}</h2>
            {isNew && <span style={styles.newBadge}>New</span>}
          </div>
          <p style={styles.description}>{description}</p>
        </div>
        {isFav && <div style={styles.favStar}>★</div>}
      </div>
    </Link>
  );
}

Card.propTypes = {
  icon: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  isNew: PropTypes.bool,
  isFav: PropTypes.bool,
  url: PropTypes.string.isRequired,
};

Card.defaultProps = {
  isNew: false,
  isFav: false,
};

const styles = {
  card: {
    display: "flex",
    border: "1px solid grey",
    borderRadius: "8px",
    padding: "16px",
    position: "relative",
    width: "100%",
    maxWidth: "400px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    backgroundColor: "white",
  },
  iconContainer: {
    marginRight: "16px",
  },
  contentContainer: {
    flex: 1,
  },
  titleContainer: {
    display: "flex",
    alignItems: "center",
  },
  title: {
    margin: 0,
    fontSize: "1.25rem",
    fontWeight: "bold",
    color: "black",
  },
  newBadge: {
    backgroundColor: "red",
    color: "white",
    borderRadius: "4px",
    padding: "2px 8px",
    marginLeft: "8px",
    fontSize: "0.75rem",
    fontWeight: "bold",
  },
  description: {
    margin: "8px 0 0 0",
    color: "brown",
  },
  favStar: {
    position: "absolute",
    top: "8px",
    right: "8px",
    fontSize: "1.5rem",
    color: "gold",
  },
};
