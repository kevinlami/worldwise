import {
  createContext,
  useEffect,
  useContext,
  useReducer,
  useCallback,
} from "react";

const URL = "http://localhost:9000";
const CitiesContext = createContext();

const initialState = {
  cities: [],
  isLoading: false,
  currentCity: {},
  error: "",
};

function reducer(state, action) {
  switch (action.type) {
    case "loading":
      return { ...state, isLoading: true };
    case "cities/loaded":
      return { ...state, isLoading: false, cities: action.payload };
    case "city/created":
      return { ...state, isLoading: false, cities: action.payload };
    case "city/deleted":
      return { ...state, isLoading: false, cities: action.payload };
    case "rejected":
      return { ...state, error: action.payload };
    case "city/loaded":
      return { ...state, isLoading: false, currentCity: action.payload };
    default:
      throw new Error("This is not a valid type");
  }
}

// eslint-disable-next-line react/prop-types
function CitiesProvider({ children }) {
  const [{ cities, isLoading, currentCity }, dispath] = useReducer(
    reducer,
    initialState
  );

  useEffect(function () {
    async function fetchCities() {
      try {
        dispath({ type: "loading" });
        const res = await fetch(`${URL}/cities`);
        const data = await res.json();
        dispath({ type: "cities/loaded", payload: data });
      } catch (error) {
        dispath({
          type: "rejected",
          payload: "There was an error loading data...",
        });
      }
    }

    fetchCities();
  }, []);

  const getCity = useCallback(
    async function getCity(id) {
      if (Number(id) === currentCity.id) return;
      try {
        dispath({ type: "loading" });
        const res = await fetch(`${URL}/cities/${id}`);
        const data = await res.json();

        dispath({ type: "city/loaded", payload: data });
      } catch (error) {
        dispath({
          type: "rejected",
          payload: "There was an error loading data...",
        });
      }
    },
    [currentCity.id]
  );

  async function createCity(newCity) {
    try {
      dispath({ type: "loading" });
      const res = await fetch(`${URL}/cities`, {
        method: "POST",
        body: JSON.stringify(newCity),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();

      dispath({ type: "city/created", payload: [...cities, data] });
    } catch (error) {
      dispath({
        type: "rejected",
        payload: "There was an error to create city.",
      });
    }
  }

  async function deleteCity(id) {
    try {
      dispath({ type: "loading" });
      await fetch(`${URL}/cities/${id}`, {
        method: "DELETE",
      });

      dispath({
        type: "city/deleted",
        payload: cities.filter((city) => city.id !== id),
      });
    } catch (error) {
      dispath({
        type: "rejected",
        payload: "There was an error to delete city.",
      });
    }
  }

  return (
    <CitiesContext.Provider
      value={{
        cities,
        isLoading,
        currentCity,
        getCity,
        createCity,
        deleteCity,
      }}
    >
      {children}
    </CitiesContext.Provider>
  );
}

function useCities() {
  const context = useContext(CitiesContext);
  if (context === undefined)
    throw new Error("CitiesContext was used outside the CitiesProvider");
  return context;
}

// eslint-disable-next-line react-refresh/only-export-components
export { CitiesProvider, useCities };
