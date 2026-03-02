import { Suspense, lazy } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Layout } from "@/components/layout";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

// Lazy load pages for code splitting
const Home = lazy(() =>
  import("@/pages/Home").then((m) => ({ default: m.Home }))
);
const PDC = lazy(() =>
  import("@/pages/PDC").then((m) => ({ default: m.PDC }))
);
const MED = lazy(() =>
  import("@/pages/MED").then((m) => ({ default: m.MED }))
);
const Statins = lazy(() =>
  import("@/pages/Statins").then((m) => ({ default: m.Statins }))
);
const Dashboard = lazy(() =>
  import("@/pages/Dashboard").then((m) => ({ default: m.Dashboard }))
);
const Measures = lazy(() =>
  import("@/pages/Measures").then((m) => ({ default: m.Measures }))
);
const Trends = lazy(() =>
  import("@/pages/Trends").then((m) => ({ default: m.Trends }))
);
const StarRatingsTrends = lazy(() =>
  import("@/pages/StarRatingsTrends").then((m) => ({
    default: m.StarRatingsTrends,
  }))
);
const ICD10 = lazy(() =>
  import("@/pages/ICD10").then((m) => ({ default: m.ICD10 }))
);
const CQLCamp = lazy(() =>
  import("@/pages/CQLCamp").then((m) => ({ default: m.CQLCamp }))
);
const RiskAdj = lazy(() =>
  import("@/pages/RiskAdj").then((m) => ({ default: m.RiskAdj }))
);
const Cutpoints = lazy(() =>
  import("@/pages/Cutpoints").then((m) => ({ default: m.Cutpoints }))
);
const PDCSas = lazy(() =>
  import("@/pages/PDCSas").then((m) => ({ default: m.PDCSas }))
);
const PDCSql = lazy(() =>
  import("@/pages/PDCSql").then((m) => ({ default: m.PDCSql }))
);
const PDCPython = lazy(() =>
  import("@/pages/PDCPython").then((m) => ({ default: m.PDCPython }))
);
const MAT = lazy(() =>
  import("@/pages/MAT").then((m) => ({ default: m.MAT }))
);
const FundOfInterop = lazy(() =>
  import("@/pages/FundOfInterop").then((m) => ({ default: m.FundOfInterop }))
);
const NotFound = lazy(() =>
  import("@/pages/NotFound").then((m) => ({ default: m.NotFound }))
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: (
      <Suspense fallback={<LoadingSpinner />}>
        <NotFound />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Home />
          </Suspense>
        ),
      },
      {
        path: "pdc",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <PDC />
          </Suspense>
        ),
      },
      {
        path: "med",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <MED />
          </Suspense>
        ),
      },
      {
        path: "statins",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Statins />
          </Suspense>
        ),
      },
      {
        path: "dashboard",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Dashboard />
          </Suspense>
        ),
      },
      {
        path: "measures",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Measures />
          </Suspense>
        ),
      },
      {
        path: "trends",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Trends />
          </Suspense>
        ),
      },
      {
        path: "star-ratings-trends",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <StarRatingsTrends />
          </Suspense>
        ),
      },
      {
        path: "icd10",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ICD10 />
          </Suspense>
        ),
      },
      {
        path: "cql-camp",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <CQLCamp />
          </Suspense>
        ),
      },
      {
        path: "risk-adj",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <RiskAdj />
          </Suspense>
        ),
      },
      {
        path: "cutpoints",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Cutpoints />
          </Suspense>
        ),
      },
      {
        path: "pdc-sas",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <PDCSas />
          </Suspense>
        ),
      },
      {
        path: "pdc-sql",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <PDCSql />
          </Suspense>
        ),
      },
      {
        path: "pdc-python",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <PDCPython />
          </Suspense>
        ),
      },
      {
        path: "mat",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <MAT />
          </Suspense>
        ),
      },
      {
        path: "fund-of-interop",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <FundOfInterop />
          </Suspense>
        ),
      },
      {
        path: "*",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <NotFound />
          </Suspense>
        ),
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
