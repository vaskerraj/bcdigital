import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import moment from 'moment';
import axiosApi from '../../helpers/api'

import { Facebook, Phone, Twitter } from 'react-feather';

const Footer = () => {
    const [footerData, setFooterData] = useState({})
    useEffect(() => {
        (async function getFooterData() {
            try {
                console.log("hello")
                const { data } = await axiosApi.get("/api/content/footer");
                setFooterData(data);
            } catch (error) {
            }
        })()
    }, [])

    console.log(footerData)
    return (
        <footer className="position-relative mt-5 d-none d-sm-block">
            <div className="footer-bottom">
                <div className="container">
                    <div className="row">
                        <div className="col-12 col-md-6 col-lg-4 mb-3">
                            <div className="d-block">
                                <div className="d-block mb-3">
                                    <div className="d-flex">
                                        {footerData?.contactNumber &&
                                            <>

                                                <span className="mr-3">
                                                    <Phone size={50} className="text-danger" />
                                                </span>
                                                <div className="d-block">
                                                    <div className="text-uppercase font16">NEED HELP?</div>
                                                    <h4 className="text-white" style={{ fontSize: '2.2rem' }}>
                                                        <a href={`tel:${footerData?.contactNumber}`}>{footerData?.contactNumber}</a>
                                                    </h4>
                                                </div>
                                            </>
                                        }
                                        <div>
                                            <ul className="social-connect d-flex list-unstyled mt-2 ml-4">
                                                <li>
                                                    <a href={footerData?.facebookLink} target="_blank" className="facebook mr-3">
                                                        <Facebook />
                                                    </a>
                                                </li>
                                                <li>
                                                    <a href={footerData?.twitterLink} target="_blank" className="twitter">
                                                        <Twitter />
                                                    </a>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div className="d-flex">
                                    <Link href={footerData?.androidLink !== undefined ? footerData.androidLink : ""}>
                                        <a target="_blank">
                                            <Image src="/download-android.png"
                                                width="181px"
                                                height="54px"
                                                className="mr-2"
                                            />
                                        </a>
                                    </Link>

                                    <Link href={footerData?.iosLink !== undefined ? footerData.iosLink : ""}>
                                        <a target="_blank">
                                            <Image src="/download-appstore.png"
                                                width="181px"
                                                height="54px"
                                            />
                                        </a>
                                    </Link>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-md-6 col-lg-2 mb-3">
                            <div className="d-block">
                                <div className="border-bottom mb-3 position-relative">
                                    <div className="section-title pb-1">
                                        <h2 className="title text-white text-uppercase">Information</h2>
                                    </div>
                                </div>
                                <ul className="footer-menu list-unstyled">
                                    <li><a href="">Privacy Policy</a></li>
                                    <li><a href="">About us</a></li>
                                    <li><a href="/contact">Contact us</a></li>
                                    <li><a href="">Secure payment</a></li>
                                    <li><a href="/seller">Seller Pannel</a></li>
                                </ul>
                            </div>
                        </div>
                        <div className="col-12 col-md-6 col-lg-2 mb-3">
                            <div className="d-block">
                                <div className="border-bottom mb-3 position-relative">
                                    <div className="section-title pb-1">
                                        <h2 className="title text-white text-uppercase">Uselful Links</h2>
                                    </div>
                                </div>
                                <ul className="footer-menu list-unstyled">
                                    <li><a href="/login">Login</a></li>
                                    <li><a href="/user/">My account</a></li>
                                </ul>
                            </div>
                        </div>
                        <div className="col-12 col-md-6 col-lg-4 mb-3">
                            <div className="d-block">
                                <div className="border-bottom mb-2 position-relative">
                                    <div className="section-title pb-1">
                                        <h2 className="title text-white text-uppercase">We Accept</h2>
                                    </div>
                                </div>
                                <div className="d-flex">

                                </div>

                                <div className="store d-flex">
                                    <Image src="/payment-esewa.png"
                                        width="100px"
                                        height="54px"
                                    />
                                    <Image src="/payment-visa.png"
                                        width="100px"
                                        height="55px"
                                        className="ml-3"
                                    />

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="coppy-right bg-white text-dark">
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <div className="text-right">
                                <div className="mb-3 mb-md-0 font15">
                                    © {moment().year()} <span className="text-capitalize text-black">BC Digital Pvt. Ltd.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer >
    );
}

export default Footer;
