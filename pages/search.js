import React, { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';

import axios from 'axios';

import Wrapper from '../components/Wrapper';

import { storeSearchTag } from '../redux/actions/searchTagAction';

const search = ({ searchQuery }) => {
    console.log(searchQuery)
    const router = useRouter();
    const dispatch = useDispatch();

    // check serach query at database 
    // if not exist with validate search then insert at database
    useEffect(() => {
        if (searchQuery) {
            setTimeout(() => {
                dispatch(storeSearchTag(searchQuery));
            }, 5000);
        }
    }, [searchQuery]);
    return (
        <Wrapper>
            <Head>
                <title>{searchQuery}-Buy Online Product At Best Price In Nepal | BC Digital</title>
                <link rel="icon" href="/favicon.ico" />
                <script defer src="/js/solid.js"></script>
                <script defer src="/your-path-to-fontawesome/js/fontawesome.js"></script>
            </Head>
            <div className="container">
                <div className="col-3"></div>
                <div className="col-9"></div>
            </div>
        </Wrapper>
    );
}
export async function getServerSideProps(context) {
    try {
        const { q: searchQuery } = context.query;
        // const { data } = await axios.post(`${process.env.api}/api/search/filter`, {
        //     query: searchQuery
        // });
        return {
            props: {
                searchQuery
            }
        }
    } catch (err) {
        return {
            props: {},
        };
    }
}

export default search;