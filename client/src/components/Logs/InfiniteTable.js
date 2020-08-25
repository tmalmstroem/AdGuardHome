import React, {
    forwardRef,
    useCallback,
    useEffect, useRef, useState,
} from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import propTypes from 'prop-types';
import Loading from '../ui/Loading';
import Header from './Cells/Header';
import { getLogs } from '../../actions/queryLogs';
import { QUERY_LOGS_PAGE_LIMIT, QUERY_LOGS_PAGE_SIZE } from '../../helpers/constants';

const InfiniteTable = ({
    isLoading,
    renderRow,
    items,
}) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const firstElementRef = useRef(null);
    const [renderLimitIdx, setRenderLimitIdx] = useState(QUERY_LOGS_PAGE_SIZE);
    const [pageYOffset, setPageYOffset] = useState(window.pageYOffset);
    const loader = useRef(null);

    const {
        isEntireLog,
        processingGetLogs,
    } = useSelector((state) => state.queryLogs, shallowEqual);

    const loadMore = useCallback((entries) => {
        const [target] = entries;
        if (target.isIntersecting && !processingGetLogs) {
            setRenderLimitIdx((idx) => idx + QUERY_LOGS_PAGE_SIZE);
            const isDivisible = renderLimitIdx % QUERY_LOGS_PAGE_LIMIT === 0;
            if (isDivisible) {
                dispatch(getLogs());
            }
            window.scrollTo(0, pageYOffset);
        }
    }, [processingGetLogs, pageYOffset, renderLimitIdx, getLogs]);


    useEffect(() => {
        const observer = new IntersectionObserver(loadMore, { threshold: 0 });

        if (loader.current) {
            observer.observe(loader.current);
        }

        return () => {
            if (loader.current) {
                observer.unobserve(loader.current);
            }
        };
    }, [loader, loadMore]);

    useEffect(() => {
        const listener = () => {
            setPageYOffset(window.pageYOffset);
        };
        const eventType = 'scroll';

        window.addEventListener(eventType, listener);
        return () => {
            window.removeEventListener(eventType, listener);
        };
    }, []);

    const Row = forwardRef(({
        rowProps,
        style,
    }, ref) => renderRow({
        rowProps,
        style,
        ref,
    }));

    Row.displayName = 'Row';

    Row.propTypes = {
        rowProps: propTypes.object.isRequired,
        style: propTypes.object,
    };

    return <div className='logs__table' role='grid'>
        {(isLoading || processingGetLogs) && <Loading />}
        <Header />
        {items.length === 0 && !processingGetLogs
            ? <label className="logs__no-data">{t('nothing_found')}</label>
            : <>{items.slice(0, renderLimitIdx).map(
                (row, idx) => {
                    const newStartElementIdx = renderLimitIdx - QUERY_LOGS_PAGE_SIZE;
                    return <Row
                                    key={`${row.time} ${row.domain}`}
                                    rowProps={row}
                                    ref={idx === newStartElementIdx ? firstElementRef : null}
                            />;
                },
            )}
                    {items.length > 0 && !isEntireLog
                    && <div className="text-center" ref={loader}>{t('loading_table_status')}</div>}
            </>}
    </div>;
};

InfiniteTable.propTypes = {
    isLoading: propTypes.bool.isRequired,
    renderRow: propTypes.func.isRequired,
    items: propTypes.array.isRequired,
};

export default InfiniteTable;
