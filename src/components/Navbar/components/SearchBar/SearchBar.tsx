import { useState } from "react";
import styles from "../../../../styles/components/Navbar/components/SearchBar/SearchBar.module.scss"
import { useRouter } from 'next/router'

const SearchBar = () => {
    const router = useRouter()
    const [search, setSearch] = useState<string>("")

    const onSubmitSearch = () => {
        router.push("/search?q=" + search)
    }

    return (
        <div className={styles.SearchBar}>
            <form action="" onSubmit={(e) => { e.preventDefault(); onSubmitSearch() }}>
                <input type="text" placeholder="Search for a product..." onChange={(e) => setSearch(e.target.value)} value={search} />
            </form>
        </div>
    )
}

export default SearchBar