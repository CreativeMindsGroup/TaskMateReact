import React from 'react'
import Styles from "./Footer.module.css";
import img from "./8c938fd4cb7a149e6fe64af3cfa01bf0.png";
import AliPayImg from "./AliPay.png";
import VisaImg from "./vsa.png";
import PayPalImg from "./paypal.png";
import MasterCardImg from "./mastercard.png";
import { Select } from '@chakra-ui/react'
import { ChakraProvider } from '@chakra-ui/react'
import { FaInstagram } from "react-icons/fa6";
import { FaPinterest, FaFacebookF } from "react-icons/fa";
import { Input } from '@chakra-ui/react'
import { MdNavigateNext } from "react-icons/md";

const Footer = () => {
  return (
    <div className={Styles.ModvaridFooter}>

      <div className={Styles.top}>
        <div className={Styles.topWebTitle}>
          <div className={Styles.topWebTitleLeft}></div>
          <div className={Styles.topWebTitleRight}>
            <div>
              <img src={img} alt="" />
            </div>
          </div>
        </div>
        <div className={Styles.topBottom}>
          <div></div>
        </div>
      </div>
      
      <div className={Styles.bootom}>

        <div className={Styles.bootomTop}>

          <div className={Styles.bootomTopTop}>
            <div className={Styles.bootomTopTopLeft}>
              <div className={Styles.bootomTopTopLefTitle}>
                <h3>Join us for what's next in Art world</h3>
                <div style={{ position: 'relative' }}>
                  <ChakraProvider>
                    <Input placeholder='Enter your Email' size='sm' />
                    <div><MdNavigateNext size={24} color='white' /></div>
                  </ChakraProvider>
                </div>
              </div>
              <div className={Styles.bootomTopTopLefSosicalIcon}>
                <div>
                  <div>
                    <FaInstagram color='white' />
                  </div>
                  <div>
                    <FaPinterest color='white' />
                  </div>
                  <div>
                    <FaFacebookF color='white' />
                  </div>
                </div>
              </div>
            </div>
            <div className={Styles.bootomTopTopRight}>
              <div className={Styles.bootomTopTopRightIn}>
                <div>
                  <p>About Morvarid</p>
                  <div>
                    <a>About us</a>
                    <a>Jobs</a>
                    <a>Art Magazine</a>
                  </div>
                </div>
                <div>
                  <p>Customer Service</p>
                  <div>
                    <a>FAQ</a>
                    <a>Contact us</a>
                    <a>Shipping</a>
                    <a>My account</a>
                    <a>Return Policy</a>
                    <a>Testimonials</a>
                  </div>
                </div>
                <div>
                  <p>Art Services</p>
                  <div>
                    <a>Free Art Advisory</a>
                    <a>Commission an Artist</a>
                    <a>Offer a Gift Card</a>
                    <a>Trade</a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={Styles.bootomTopBottom}>
            <p>Morvarid © 2023. All rights reserved</p>
            <div>
              <ChakraProvider>
                <Select className={Styles.chakraSelcetDropdown1} placeholder='ENG'>
                  <option value='option1'>Option 1</option>
                  <option value='option2'>Option 2</option>
                  <option value='option3'>Option 3</option>
                </Select>
                <Select className={Styles.chakraSelcetDropdown2} placeholder='USD'>
                  <option value='option1'>Option 1</option>
                  <option value='option2'>Option 2</option>
                  <option value='option3'>Option 3</option>
                </Select>
              </ChakraProvider>

            </div>
          </div>

        </div>

        <div className={Styles.bootomBootom}>
          <div>
            <img className={Styles.bBimg1} src={AliPayImg} alt="" />
            <img className={Styles.bBimg2} src={VisaImg} alt="" />
            <img className={Styles.bBimg3} src={PayPalImg} alt="" />
            <img className={Styles.bBimg4} src={MasterCardImg} alt="" />
          </div>
        </div>

      </div>
    </div>
  )
}

export default Footer