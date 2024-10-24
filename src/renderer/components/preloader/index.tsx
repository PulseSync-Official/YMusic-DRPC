import React from 'react'
import * as styles from './preloader.module.scss'

const Preloader: React.FC = ({}) => {
    return (
        <div className={styles.preloader}>
            <div className={styles.container}>
                <svg
                    className={styles.logo}
                    width="82"
                    height="82"
                    viewBox="0 0 82 82"
                    fill="#fff"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <rect
                        x="42.3003"
                        y="58.5426"
                        width="39.6997"
                        height="23.4286"
                        rx="6"
                        fill="#fff"
                    />
                    <path
                        d="M0 6C0 2.68629 2.68629 0 6 0L76 0C79.3137 0 82 2.68629 82 6V46.7143C82 50.028 79.3137 52.7143 76 52.7143H42.4444C39.1307 52.7143 36.4444 55.4006 36.4444 58.7143V76C36.4444 79.3137 33.7582 82 30.4444 82H6C2.68629 82 0 79.3137 0 76V35.2857C0 31.972 2.68629 29.2857 6 29.2857H42.627C44.2444 29.2857 45.5556 27.9745 45.5556 26.3571V26.3571C45.5556 24.7397 44.2444 23.4286 42.627 23.4286H6C2.68629 23.4286 0 20.7423 0 17.4286V6Z"
                        fill="#fff"
                    />
                </svg>
                <svg
                    className={styles.load}
                    width="43"
                    height="43"
                    viewBox="0 0 43 43"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M28.3108 4.3839C28.9394 2.80411 28.1702 0.99026 26.5169 0.593517C23.867 -0.0423745 21.1108 -0.170884 18.3958 0.225281C14.6613 0.77019 11.136 2.28852 8.17428 4.62768C5.21257 6.96683 2.91877 10.0444 1.52343 13.551C0.128088 17.0576 -0.319628 20.8698 0.225281 24.6042C0.77019 28.3387 2.28852 31.864 4.62768 34.8257C6.96683 37.7874 10.0444 40.0812 13.551 41.4766C17.0576 42.8719 20.8698 43.3196 24.6042 42.7747C27.3193 42.3786 29.9238 41.4679 32.2816 40.1013C33.7526 39.2487 33.9714 37.2907 32.9176 35.9564V35.9564C31.8638 34.622 29.9364 34.4274 28.4188 35.1942C26.9474 35.9376 25.3598 36.442 23.7152 36.682C21.0502 37.0709 18.3298 36.7514 15.8275 35.7556C13.3251 34.7599 11.1289 33.123 9.45962 31.0095C7.79036 28.8959 6.70685 26.3802 6.31799 23.7152C5.92914 21.0502 6.24863 18.3298 7.24437 15.8275C8.24011 13.3251 9.87701 11.1289 11.9905 9.45962C14.1041 7.79036 16.6198 6.70685 19.2848 6.31799C20.9293 6.07804 22.5949 6.10782 24.2174 6.39978C25.8908 6.70091 27.6821 5.9637 28.3108 4.3839V4.3839Z"
                        fill="#D2E5F1"
                    />
                </svg>
            </div>
        </div>
    )
}

export default Preloader
