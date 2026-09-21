import { previewTiles, starterDetailCards, starterWorkflowSteps, foodIdeaTags } from "@/lib/snapchef-content";
import { GuideGrid } from "./scan-guide";
import styles from "../snapchef-app.module.css";

export function StarterView({ loadExample }: { loadExample: () => void }) {
  return (
            <div className={styles.emptyState}>
              <div className={styles.emptyPhoto} aria-hidden="true">
                <div>
                  <span>What you get</span>
                  <strong>Recipes from the food already in front of you</strong>
                </div>
              </div>

              <div className={styles.starterIntro}>
                <p className={styles.eyebrow}>Recipe workspace</p>
                <h2>Ready when your plate is.</h2>
                <p className={styles.summary}>
                  SnapChef turns a food image into a practical cooking plan with ingredients,
                  steps, swaps, and videos.
                </p>
              </div>

              <div className={styles.emptyGrid}>
                {previewTiles.map((tile) => (
                  <span key={tile.label}>
                    <small>{tile.label}</small>
                    <strong>{tile.value}</strong>
                  </span>
                ))}
              </div>

              <div className={styles.starterActions}>
                <button className={styles.exampleButton} type="button" onClick={loadExample}>
                  See an example result
                </button>
              </div>

              <div className={styles.starterDetails}>
                <GuideGrid cards={starterDetailCards} />
              </div>

              <div className={styles.starterInfoGrid}>
                <section className={styles.aboutPanel}>
                  <div>
                    <p className={styles.eyebrow}>About</p>
                    <h3>Useful plans from food photos.</h3>
                    <p>
                      Built for students, leftovers, screenshots, busy nights, and quick meal
                      decisions. Feel free to use the app to its full potential, but it’s designed to be helpful
                      even if you just want a rough recipe or a video search for a mystery meal.
                    </p>
                  </div>
                </section>

                <section className={styles.workflowPanel}>
                  <div>
                    <p className={styles.eyebrow}>How it works</p>
                    <h3>Picture, preferences, plan.</h3>
                  </div>
                  <div className={styles.workflowSteps}>
                    {starterWorkflowSteps.map((step) => (
                      <span key={step.label}>
                        <small>{step.label}</small>
                        <strong>{step.title}</strong>
                      </span>
                    ))}
                  </div>
                </section>

                <section className={styles.foodIdeaPanel}>
                  <div>
                    <p className={styles.eyebrow}>Food ideas</p>
                    <h3>Some good first scans.</h3>
                  </div>
                  <div className={styles.tagCloud} aria-label="Food ideas">
                    {foodIdeaTags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                </section>

                <section className={styles.contactPanel}>
                  <div>
                    <p className={styles.eyebrow}>Contact Me</p>
                    <h3>Your feedback would help make the app better.</h3>
                  </div>
                  <div className={styles.contactLinks}>
                    <a href="mailto:fanyanwu@mcneese.edu">Email feedback</a>
                    <a
                      href="https://github.com/Fidel2197/snapchef"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      GitHub project
                    </a>
                  </div>
                </section>

                <section className={styles.savePanel}>
                  <div>
                    <p className={styles.eyebrow}>Save later</p>
                    <h3>Keep the good recipes close.</h3>
                    <p>Sign in to build a small history of meals, grocery lists, and favorite scans.</p>
                  </div>
                  <div className={styles.featurePillGrid} aria-label="Saved recipe benefits">
                    <span>Saved scans</span>
                    <span>Recipe history</span>
                    <span>Grocery lists</span>
                  </div>
                </section>

                <section className={styles.photoFinishPanel}>
                  <div>
                    <p className={styles.eyebrow}>Next plate Ideas</p>
                    <h3>Dorm bowls, leftovers, quick dinners etc.</h3>
                  </div>
                </section>
              </div>
            </div>
  );
}
