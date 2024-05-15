import React from 'react';
import Styles from './NotFountPage.module.css';
import { useNavigate } from 'react-router';

export default function NotFoundPage() {
    const navigate = useNavigate();
    return (
        <div className={Styles.notFoundContainer}>
            <div className={Styles.notFoundText}>404 - Page Not Found</div>
            <a onClick={() =>navigate("/")} className={Styles.homeLink}>Go to Home</a>
        </div>
    );
}
