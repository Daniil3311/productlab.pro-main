import { Select, Spin } from "antd";
import debounce from "lodash/debounce";
import React, { useMemo, useRef, useState } from "react";

const DebounceSelect = ({ fetchOptions, debounceTimeout = 800, ...props }) => {
    const [options, setOptions] = useState([]);
    const [fetching, setFetching] = useState(false);
    const fetchRef = useRef(0);

    const debounceFetcher = useMemo(() => {
        fetchOptions().then((res) => {
            setOptions(res);
        });

        const loadOptions = (value) => {
            fetchRef.current += 1;
            const fetchId = fetchRef.current;
            setOptions([]);
            setFetching(true);
            fetchOptions(value).then((newOptions) => {
                if (fetchId !== fetchRef.current) {
                    // for fetch callback order
                    return;
                }

                setOptions(newOptions);
                setFetching(false);

                if (props.service === "productlab") {
                    let obj = options.find((ob) => ob.label === value);

                    if (!obj && value) {
                        setOptions([
                            ...newOptions,
                            { label: `${value} (Новый)`, value: value, title: "new" },
                        ]);
                    }
                }
            });
        };

        return debounce(loadOptions, debounceTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchOptions, debounceTimeout]);
    return (
        <Select
            labelInValue
            filterOption={false}
            onSearch={debounceFetcher}
            notFoundContent={fetching ? <Spin size="small" /> : null}
            {...props}
            options={options}
        />
    );
}; // Usage of DebounceSelect

export { DebounceSelect };
