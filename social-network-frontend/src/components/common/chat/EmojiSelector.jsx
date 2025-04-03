import styles from './EmojiSelector.module.css';
import { emojiMap } from './emojiMap.js';

const EmojiSelector = ({ onEmojiSelect }) => {
  return (
    <div className={styles.emojiSelector}>
      {Object.entries(emojiMap).map(([category, emojis]) => (
        <div key={category} className={styles.emojiCategory}>
          <h3>{category}</h3>
          <div className={styles.emojiGrid}>
            {emojis.map((emoji) => (
              <button key={emoji} onClick={() => onEmojiSelect(emoji)}>
                {emoji}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default EmojiSelector;