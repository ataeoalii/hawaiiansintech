import Head from "next/head";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Nav from "../components/Nav.js";
import Filter from "../components/Filter.js";
import Title from "../components/Title.js";
import MetaTags from "../components/Metatags.js";
import FilterSVG from "../components/Icons/FilterSVG.js";
import HitLogo from "../components/HitLogo.js";

export async function getStaticProps() {
  // TODO: Before mergin
  //  - Swap back since api mattered
  const origin =
    process.env.NODE_ENV !== "production"
      ? "http://localhost:3000"
      // : "https://hawaiiansintech.org";
      : "https://hawaiiansintech-hdzo8cwrs-hawaiians.vercel.app";

  const res = await fetch(`${origin}/api/technologists`);
  const technologists = await res.json();

  let roles = technologists.map((technologist) => {
    return { label: technologist.role, active: false, category: "role" };
  });

  let regions = technologists.map((technologist) => {
    return { label: technologist.region, active: false, category: "region" };
  });

  let filters = roles.concat(regions);

  return {
    props: {
      technologists,
      filters,
    },
  };
}

export default function Home({ technologists, filters }) {
  const [isReady, setIsReady] = useState(false);
  const [technologistsList, setTechnologistsList] = useState(null);
  const [filterIsOpen, setFilterIsOpen] = useState(false);
  const [filterList, setFilterList] = useState(filters);
  const [filterCategory, setFilterCategory] = useState(null);

  useEffect(() => {
    setTechnologistsList(shuffle(technologists).sort((a, b) => a.order - b.order));
  }, []);

  // Filter
  const handleCloseFilter = (e) => {
    setFilterIsOpen(false);

    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  const handleOpenFilter = (category) => {
    setFilterCategory(category);
    setFilterIsOpen(true);
  };

  const clearFilter = () => {
    let newFilter = filters.map(({ label }) => {
      return { label: label, active: false };
    });

    setFilterList(newFilter);
    setTechnologistsList(
      shuffle(technologists).sort((a, b) => a.featured - b.featured)
    );
  };

  const handleFilterClick = (item) => {
    let indexof = filterList.indexOf(item);
    filterList[indexof].active = filterList[indexof].active ? false : true;
    setFilterList(filterList);

    // Get Each column
    let filterExpert = filterList
      .filter((f) => f.category == "role")
      .map((d) => d.label);
    let filterRegion = filterList
      .filter((f) => f.category == "region")
      .map((d) => d.label);

    // Find active
    let activeFilters = filterList
      .filter((d) => d.active == true)
      .map((d) => d.label);

    // If none in that category check all
    if (filterExpert.filter((f) => activeFilters.includes(f)).length <= 0)
      activeFilters = activeFilters.concat(filterExpert);
    if (filterRegion.filter((f) => activeFilters.includes(f)).length <= 0)
      activeFilters = activeFilters.concat(filterRegion);

    // Filter render list
    if (activeFilters.length > 0)
      setTechnologistsList(
        technologists.filter(
          (d) =>
            activeFilters.includes(d.role) &&
            activeFilters.includes(d.region)
        )
      );
    else clearFilter();
  };

  return (
    <div
      className="container"
      style={{
        overflow: isReady ? "hidden" : "visible",
      }}
    >
      <Head>
        <title>Hawaiians in Technology</title>
        <link id="favicon" rel="alternate icon" href="/favicon.ico" />
        <MetaTags />
      </Head>

      {!isReady ? (
        <Content
          technologists={technologistsList}
          handleOpenFilter={handleOpenFilter}
          onClick={filterIsOpen ? handleCloseFilter : undefined}
          className={filterIsOpen ? "filterIsOpen" : ""}
        />
      ) : null}

      <AnimatePresence>
        {filterIsOpen ? (
          <Filter
            items={filterList.filter((f) => f.category == filterCategory)}
            handleFilterClick={handleFilterClick}
            handleCloseFilter={handleCloseFilter}
            categoryName={filterCategory}
          />
        ) : null}
      </AnimatePresence>

      <style global jsx>{`
        html,
        body {
          overflow: ${filterIsOpen ? "hidden" : "auto"};
        }
      `}</style>
    </div>
  );
}

function Content({ technologists, handleOpenFilter, className, onClick }) {
  const tableHeaderRef = useRef();

  useEffect(() => {
    const header = tableHeaderRef.current;
    const sticky = header.getBoundingClientRect().top + 40;
    const scrollCallBack = window.addEventListener("scroll", () => {
      if (window.pageYOffset > sticky) {
        header.classList.add("sticky");
      } else {
        header.classList.remove("sticky");
      }
    });
    return () => {
      window.removeEventListener("scroll", scrollCallBack);
    };
  }, []);

  return (
    <div className={className} onClick={onClick}>
      <HitLogo />
      <Nav />
      <Title className="title m0 p0" text="Hawaiians*in&nbsp;Technology" />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <table className="large tableContent" cellSpacing="0">
          <thead id="tableHeader" ref={tableHeaderRef}>
            <tr>
              <td>Name</td>
              <td
                className="thsize-aux dn filterTable"
                onClick={(e) => {
                  handleOpenFilter("region");

                  e.preventDefault();
                }}
              >
                Location <FilterSVG />
              </td>
              <td
                className="thsize-aux filterTable"
                onClick={(e) => {
                  handleOpenFilter("role");

                  e.preventDefault();
                }}
              >
                Role / Background <FilterSVG />
              </td>
              <td className="thsize-link"></td>
            </tr>
          </thead>
          {technologists != null ? (
            <tbody>
              {technologists.map((d, i) => (
                <tr key={`${d.name}-${i}`}>
                  <td><a href={d.link} target="_blank">{d.name}</a></td>
                  <td className="thsize-aux dn">
                    <a href={d.link} target="_blank">
                      <h4 className="thtitle-eyebrow">{d.location},</h4>
                      <h3 className="thtitle-headline">{d.region}</h3>
                    </a>
                  </td>
                  <td className="thsize-aux">
                    <a href={d.link} target="_blank">
                      <h3 className="thtitle-headline">{d.role}</h3>
                    </a>
                  </td>
                  <td className="thsize-link"><a href={d.link} target="_blank">→</a></td>
                </tr>
              ))}
            </tbody>
          ) : null}
        </table>
      </motion.div>
      <style jsx>{`
        .tableContent {
          padding-top: 18vh;
        }

        .filterTable {
          cursor: pointer;
        }

        .filterTable:hover {
          color: var(--color-link);
        }

        thead {
          height: 2.2rem;
        }

        td {
          padding-right: 1rem;
        }

        .thsize-aux {
          width: 25%;
        }

        .thsize-link {
          width: 2rem;
          text-align: right;
        }

        .thtitle-eyebrow,
        .thtitle-headline {
          display: inline-block;
          font-size: 1.6rem;
          font-weight: 400;
          margin: 0;
          line-height: 1.5;
        }

        .thtitle-eyebrow {
          margin-right: 0.33rem;
        }

        .thtitle-headline {
          font-size: 1.6rem;
        }

        tbody a {
          width: 100%;
          padding-bottom: 0.6em;
          padding-top: 0.6em;
          color: inherit;
          display: inline-block;
        }

        table tbody td {
          padding-top: 0;
          padding-bottom: 0;
        }
      `}</style>

    </div>
  );
}

function shuffle(array) {
  var m = array.length,
    temp,
    i;

  while (m) {
    i = Math.floor(Math.random() * m--);
    temp = array[m];
    array[m] = array[i];
    array[i] = temp;
  }

  return array;
}
