import React from "react";
import Image from "next/image";

// Layout component for managing the page structure
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar for branding and promotional content (visible only on large screens) */}
      <section className="hidden w-1/2 items-center justify-center bg-brand p-10 lg:flex xl:w-2/5">
        <div className="flex max-h-[800px] max-w-[430px] flex-col justify-center space-y-12">
          {/* Logo with app name */}
          <div className="flex items-center space-x-4">
            <Image
              src="/assets/icons/logo-full.svg"
              alt="logo"
              width={500}
              height={120}
              className="h-auto"
            />
          </div>

          {/* Branding text */}
          <div className="space-y-5 text-white">
            <h1 className="h1">Keep What Matters, Everywhere.</h1>
            <p className="body-1">
              An open-source, cloud-native storage solution for seamless file
              accessibility.
            </p>
          </div>

          {/* Decorative image with hover effects */}
          <Image
            src="/assets/images/files.png"
            alt="Files"
            width={420}
            height={420}
            className="transition-all hover:rotate-2 hover:scale-105"
          />
        </div>
      </section>

      {/* Main content area for dynamic page content */}
      <section className="flex flex-1 flex-col items-center bg-white p-4 py-10 lg:justify-center lg:p-10 lg:py-0">
        {/* Logo displayed above the content (visible only on smaller screens) */}
        <div className="mb-16 lg:hidden">
          <div className="flex items-center space-x-4">
            <Image
              src="/assets/icons/logo-full-brand.svg"
              alt="logo"
              width={500}
              height={120}
              className="h-auto w-[300px] lg:w-[350px]"
            />
          </div>
        </div>

        {/* Children components dynamically injected here */}
        {children}
      </section>
    </div>
  );
};

export default Layout;
