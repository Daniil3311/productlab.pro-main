import { useEffect, useMemo, useState } from "react";

import { Fragment } from "react";

import { CardList } from "../../components";

import { useNavigate } from "react-router-dom";

import { getCategories } from "../../api/api";

import no_image from "../../images/no_main.png";

import { API_URL } from "../../api/api";

const url = `${API_URL}/`;

const AcademyPage = ({ token }) => {
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);

    const formatCategories = useMemo(() => {
        return categories.map((category) => {
            return {
                title: category.name,
                id: category.id,
                description: null,
                image: category.image ? url + category.image : no_image,
            };
        });
    }, [categories]);

    const handleClick = (id) => navigate(`/academy/${id}/null/0/?token=${token}`);

    useEffect(() => {
        const initial = async () => {
            await getCategories(token).then((data) => setCategories(data));
        };

        initial();
    }, [token]);

    return (
        <Fragment>
            <CardList onSubmit={handleClick} data={formatCategories} />
        </Fragment>
    );
};

export { AcademyPage };
