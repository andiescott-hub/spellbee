import { Modal } from './Modal';

export function HelpModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal label="How to Play" onClose={onClose}>
      <section className="help">
        <h2 className="modal-heading">How to Play Spelling Bee</h2>
        <h3 className="help-subtitle">Create words using letters from the hive.</h3>
        <ul>
          <li>Words must contain at least 4 letters.</li>
          <li>Words must include the center letter.</li>
          <li>Our word list does not include words that are obscure, hyphenated, or proper nouns.</li>
          <li>No cussing either, sorry.</li>
          <li>Letters can be used more than once.</li>
        </ul>
        <h3 className="help-subtitle">Score points to increase your rating.</h3>
        <ul>
          <li>4-letter words are worth 1 point each.</li>
          <li>Longer words earn 1 point per letter.</li>
          <li>
            Each puzzle includes at least one “pangram” which uses every letter. These are worth 7 extra points!
          </li>
        </ul>
        <h3 className="help-subtitle">Tips</h3>
        <ul>
          <li>Tap your rank to see the points needed for each rank today.</li>
          <li>Stuck? The light bulb has today’s hints, and the clock has yesterday’s answers.</li>
          <li>On a keyboard, type the letters, press Enter to submit, Backspace to delete and Space to shuffle.</li>
        </ul>
        <p className="help-footer">New puzzles are released daily at midnight.</p>
      </section>
    </Modal>
  );
}
