import { Suspense } from "react";

export default function AvailibilityLayout({ children }) {
  return (
    <div className="mx-auto">
      <Suspense
        fallback={
          <div>
            <span className="text-lg text-blue-500">
              Loading availability...
            </span>
          </div>
        }
      >
        {children}
      </Suspense>
    </div>
  );
}
