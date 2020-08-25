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

    const intersectionObserverCallback = useCallback((entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
            setRenderLimitIdx((idx) => {
                const newIdx = idx + QUERY_LOGS_PAGE_SIZE;
                const isDivisible = idx % QUERY_LOGS_PAGE_LIMIT === 0;

                if (isDivisible) {
                    (async () => {
                        await dispatch(getLogs());
                    })();
                }

                return newIdx;
            });
            // todo handle async load
            setPageYOffset((pageYOffset) => {
                window.scrollTo(0, pageYOffset);
                return pageYOffset;
            });
        }
    }, [pageYOffset, firstElementRef.current]);

    const observer = useRef(
        new IntersectionObserver(intersectionObserverCallback, { threshold: 0 }),
    );

    const [element, setElement] = useState(null);

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

    useEffect(() => {
        const currentElement = element;
        const currentObserver = observer.current;

        if (currentElement) {
            currentObserver.observe(currentElement);
        }

        return () => {
            if (currentElement) {
                currentObserver.unobserve(currentElement);
            }
        };
    }, [element]);

    const {
        isEntireLog,
        processingGetLogs,
    } = useSelector((state) => state.queryLogs, shallowEqual);

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
                    && <div className="text-center" ref={setElement}>{t('loading_table_status')}</div>}
            </>}
    </div>;
};

InfiniteTable.propTypes = {
    isLoading: propTypes.bool.isRequired,
    renderRow: propTypes.func.isRequired,
    items: propTypes.array.isRequired,
};

export default InfiniteTable;
