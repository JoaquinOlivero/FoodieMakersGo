import { useState } from "react";
import styles from "../../../../styles/components/Navbar/components/SearchBar/SearchBar.module.scss"

const SearchBar = () => {
    const [search, setSearch] = useState<string | null>(null)

    const onSubmitSearch = () => {
        console.log(search)
    }

    return (
        <div className={styles.SearchBar}>
            <form action="" onSubmit={(e) => { e.preventDefault(); onSubmitSearch() }}>
                <input type="text" placeholder="Search for a product..." onChange={(e) => setSearch(e.target.value)} />
            </form>
        </div>
    )
}

export default SearchBar