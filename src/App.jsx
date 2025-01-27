import Search from "./components/Search.jsx";
import {useEffect, useState} from "react";
import Spinner from "./components/Spinner.jsx";
import MovieCard from "./components/MovieCard.jsx";
import {useDebounce} from "react-use";
import {updateSearchCount} from "./appwrite.js";

const API_BASE_URL = "https://api.themoviedb.org/3";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
    method: "GET",
    headers: {
        accept: "application/json",
        Authorization: `Bearer ${API_KEY}`
    }
}

const App = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [movies, setMovies] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    // Debounce the search term to prevent making too many API requests
    // by waiting for the user to stop typing form 500ms
    useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm])

    const fetchMovies = async (query = '') => {

        setIsLoading(true);
        setErrorMessage('');

        try {
            const endpoint =  query ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
                                             : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
            const response = await fetch(endpoint, API_OPTIONS);

            if (!response.ok) {
                throw new Error(`Error fetching movies: ${response.statusText}`);
            }
            const data = await response.json();


            if(data.Response === "False") {
                setErrorMessage(data.Error || 'Failed to fetch movies. Please try again later.');
                setMovies([])
                return;
            }

            setMovies(data.results || []);
            updateSearchCount()
        } catch (error) {
            console.error(`Error fetching movies: ${error}`);
            setErrorMessage("Error fetching movies. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchMovies(debouncedSearchTerm)
    }, [debouncedSearchTerm])

    return (
        <main>
            <div className="pattern"/>

            <div className="wrapper">
                <header>
                    <img src="./hero.png" alt="Hero Banner" />
                    <h1>
                        Find <span className="text-gradient">Movies</span> You&#39;ll Enjoy without the Hassle
                    </h1>
                    <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
                </header>

                <section className={"all-movies"}>
                    <h2 className={"mt-[20px]"}>All Movies</h2>
                    {/*{errorMessage && <p className="text-red-500">{errorMessage}</p>}*/}
                    {isLoading ? (<Spinner />) : errorMessage ?  (<p className="text-red-500">{errorMessage}</p>) : (
                        <ul>
                            {movies.map((movie) => (
                                <MovieCard key={movie.id} movie={movie}/>
                            ))}
                        </ul>
                    )
                    }
                </section>
            </div>

        </main>
    )
}
export default App
