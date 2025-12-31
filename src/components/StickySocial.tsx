import React from "react";
import "./sticky-social.scss";

const StickySocial = () => {
    return (
        <div className="sticky-social">
            <a href="tel:0987654321" className="sticky-btn call">📞</a>
            <a href="https://zalo.me/0987654321" target="_blank" rel="noreferrer" className="sticky-btn zalo">💬</a>
            <a href="https://www.facebook.com/yourpage" target="_blank" rel="noreferrer" className="sticky-btn fb">🔵</a>
        </div>
    );
};

export default StickySocial;
