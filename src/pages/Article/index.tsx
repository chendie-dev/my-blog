import React, { useLayoutEffect, useState } from 'react'
import './index.scss'
import { Card, Col, Row, Space } from 'antd'
import { useLocation } from 'react-router-dom'
import { getArticleListReq, getCategoryListReq, getTagListReq } from '../../requests/api'
import { FormatData } from '../../Hooks/formatData'
import { MdCatalog, MdPreview } from 'md-editor-rt';
import 'md-editor-rt/lib/preview.css';
import Footer from '../../components/Layout/Footer'
const scrollElement = document.documentElement;
export default function Article() {
    const location = useLocation()
    const [data, setData] = useState<articleItemType>({} as articleItemType)
    useLayoutEffect(() => {
        getArticle()
    }, [location.pathname.split('/')[2]])
    const getArticle = async () => {
        let res = await getArticleListReq({
            orderByFields: {},
            pageNum: 1,
            pageSize: 1,
            queryParam: {
                isDelete: false,
                articleId: location.pathname.split('/')[2],
                articleStatus:1
            }
        })
        if (res.code !== 200) return
        console.log(res)
        initArticleList(res)
    }
    const initArticleList = async (res: articleListRes) => {
        let articleListContext1: articleListRes = JSON.parse(JSON.stringify(res))
        let articleList = await Promise.all(
            articleListContext1.data.data.map(async (el) => {
                let res1 = await Promise.all(
                    el.tagIds.map(el1 => {
                        return getTagListReq({
                            orderByFields: {},
                            pageNum: 1,
                            pageSize: 1,
                            queryParam: {
                                isDelete: false,
                                tagId: el1,
                            }
                        });
                    })
                );
                for (let i = 0; i < res1.length; i++) {
                    el.tagIds[i] = res1[i].data.data[0].tagName;
                }
                let res2 = await getCategoryListReq({
                    orderByFields: {},
                    pageNum: 1,
                    pageSize: 1,
                    queryParam: {
                        isDelete: false,
                        categoryId: el.categoryId,
                    }
                });
                el.categoryId = res2.data.data[0].categoryName
                el.createTime = FormatData(el.createTime);
                return el
            })
        )
        setData(articleList[0])
        console.log('set')

    }
    const [id] = useState('preview-only');
    if(JSON.stringify(data) == "{}")return (<></>)
    else{
        return (
            <>
                <div className='article' >
                    <React.Fragment key={data.articleId}>
                        <div className="banner" style={{ background: `url(${data.articleCoverUrl}) center center / cover no-repeat` }} >
                            <div className="article-detail">
                                <div className="line">
                                    <h1 className="article-title">{data.articleTitle}</h1>
                                </div>
                                <div className="line">
                                    <Space  >
                                        <span className="time"> 发表于{data.createTime}</span>
                                        <span>|</span>
                                        <span>{data.categoryId}</span>
                                    </Space>
                                </div>
                                <div className="line">
                                    <Space >
                                        {
                                            data.tagIds.map((el1, index) => {
                                                return (
                                                    <span key={index}>{el1}</span>
                                                )
                                            })
                                        }
                                    </Space>
                                </div>
                            </div>
                        </div>
                        <div className="content">
                            <Row className='animated zoomIn'>
                                <Col span={15} push={2}>
                                    <Card bordered={false}>
                                        <MdPreview modelValue={data.articleContent} editorId={id} />
                                    </Card>
                                </Col>
                                <Col span={4} push={3}>
                                    <Card bordered={false} className='fixed-card'>
                                        <div className="right-title">
                                            <i className="iconfont iconhanbao" style={{ fontSize: "16.8px" }} />
                                            <span style={{ marginLeft: "10px", fontWeight: 'bolder' }}>目录</span>
                                        </div>
                                        <MdCatalog editorId={id} scrollElement={scrollElement} className='catalog' scrollElementOffsetTop={84} offsetTop={104} />
                                    </Card>
                                </Col>
                            </Row>
                        </div>
                    </React.Fragment>
    
                <Footer />
                </div>
            </>
        )
    }
}
