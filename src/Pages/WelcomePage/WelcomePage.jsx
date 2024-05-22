import React from 'react'
import Styles from './WelcomePage.module.scss'
import WelcomePageSideBarMenu from '../../Components/HomePageSideBarMenu/WelcomePageSideBarMenu'
import WelcomePageContent from './WelcomePageContent'
export default function WelcomePage() {
    return (
        <div className={Styles.MainContainer}>
            <WelcomePageSideBarMenu />
            <WelcomePageContent />
        </div>
    )
}
