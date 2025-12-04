import Image from "next/image";
import Link from "next/link";
import Footer from "../components/Footer";
import { getConcepts } from "@/lib/sanity/queries";
import ConceptsClientWrapper from "./ConceptsClientWrapper";
import ConceptCard from "./ConceptCard";

export default async function Concepts() {
  let concepts = [];
  try {
    concepts = await getConcepts();
  } catch (error) {
    console.error("Error fetching concepts:", error);
    concepts = [];
  }

  return (
    <main className="min-h-screen font-sans bg-gray-100">
      <ConceptsClientWrapper />

      {/* Hero Section */}
      <section className="relative w-full h-36 md:h-48 overflow-hidden">
        <Image
          src="/images/concept.jpg"
          alt="Concepts Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4 text-center z-10">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-medium mb-2">
            Inside DXI
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl font-light">
            How We Think. How We Create.
          </p>
        </div>
      </section>

      {/* Split Layout Section */}
      <section className="px-4 md:px-6 lg:px-8 py-6 md:py-8">
        <div className="max-w-7xl mx-auto bg-white rounded-2xl overflow-hidden shadow-lg flex flex-col lg:flex-row">
          {/* Left Sidebar - About DXI & Support */}
          <div className="w-full lg:w-1/3 bg-white p-8 lg:p-10 flex flex-col">
            {/* About DXI */}
            <div className="mb-8">
              {/* Logo in black circle */}
              <div className="w-20 h-20 rounded-full bg-black flex items-center justify-center mb-6">
                <Image
                  src="/images/dxilogo2.png"
                  alt="DXI Logo"
                  width={50}
                  height={50}
                  className="object-contain"
                />
              </div>
              <h2 className="text-xl font-bold text-black mb-4">About DXI</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                DXI Marketing is a leading agency crafting impactful digital
                experiences and insights. With over a decade of expertise, we blend
                creativity and strategy to engage audiences. Our goal is to help
                brands grow, connect, and thrive in the modern marketplace.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/contact"
                  className="bg-[#EF1111] text-white px-6 py-3 rounded-full text-sm font-semibold text-center hover:bg-[#CC0E0E] transition"
                >
                  Send Us a Brief
                </Link>
                <Link
                  href="/projects"
                  className="bg-[#FFE5E5] text-[#EF1111] px-6 py-3 rounded-full text-sm font-semibold text-center hover:bg-[#FFD6D6] transition"
                >
                  Projects
                </Link>
              </div>
            </div>

            {/* Support Section */}
            <div className="mt-auto">
              <h2 className="text-xl font-bold text-black mb-4">Support</h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-[#EF1111] mt-1 flex-shrink-0">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 30 30"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M19.375 13.75C19.375 16.1662 17.4162 18.125 15 18.125C12.5838 18.125 10.625 16.1662 10.625 13.75C10.625 11.3338 12.5838 9.375 15 9.375C17.4162 9.375 19.375 11.3338 19.375 13.75Z"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        d="M15 2.5C21.0883 2.5 26.25 7.54123 26.25 13.6573C26.25 19.8706 21.0041 24.2309 16.1588 27.1959C15.8056 27.3953 15.4062 27.5 15 27.5C14.5938 27.5 14.1944 27.3953 13.8412 27.1959C9.00487 24.202 3.75 19.8921 3.75 13.6573C3.75 7.54123 8.9118 2.5 15 2.5Z"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                  </span>
                  <span className="text-sm text-gray-700 leading-tight">
                    17a, Aroyewun Street, Off Ramat Crescent, Ogudu GRA, Lagos
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#EF1111] mt-1 flex-shrink-0">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 30 30"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M10.5112 4.92647C9.67163 4.30756 9.10624 4.16783 8.80287 4.22704C7.55131 4.47129 6.8094 4.9585 5.80425 5.96364C4.43223 7.33564 3.76652 8.3601 4.05646 9.91338C4.39028 11.7017 6.02116 14.4311 10.5162 18.9262C15.0109 23.4209 17.7568 25.0689 19.5551 25.4098C20.3885 25.5677 21.0232 25.4443 21.5927 25.1638C22.2016 24.8639 22.7878 24.3591 23.4602 23.6573C24.0566 23.035 24.4184 22.6006 24.6716 22.1733C24.9129 21.7661 25.0839 21.316 25.216 20.6399C25.2753 20.3365 25.1356 19.7711 24.5165 18.9314C23.9392 18.1483 23.1247 17.3705 22.3717 16.7356C21.8748 16.3166 21.106 16.2899 20.4851 16.7548L18.5871 18.1756C16.8752 19.4571 14.483 19.2736 12.9726 17.7632L11.6792 16.4697C10.1688 14.9593 9.98525 12.5672 11.2668 10.8553L12.6875 8.95741C13.1524 8.33639 13.1257 7.56764 12.7067 7.07076C12.0719 6.31793 11.2942 5.50365 10.5112 4.92647ZM11.9946 2.91413C13.0064 3.65999 13.9302 4.64359 14.6179 5.45911C15.8714 6.94564 15.7692 9.01251 14.6889 10.4556L13.2681 12.3535C12.7388 13.0605 12.8072 14.0622 13.447 14.702L14.7404 15.9954C15.3801 16.6351 16.3818 16.7035 17.0889 16.1742L18.9869 14.7534C20.4299 13.6732 22.4967 13.5709 23.9832 14.8243C24.7989 15.5121 25.7828 16.4359 26.5288 17.4479C27.2331 18.4032 27.9417 19.7262 27.6696 21.1192C27.4949 22.0137 27.2384 22.7457 26.8225 23.4476C26.4185 24.1294 25.8938 24.7311 25.2653 25.387C24.537 26.1471 23.7067 26.9094 22.6973 27.4065C21.6486 27.923 20.4635 28.1265 19.0896 27.8661C16.4733 27.3702 13.2547 25.2003 8.74841 20.6939C4.2424 16.1879 2.0863 12.9832 1.59891 10.3721C1.06764 7.52601 2.54649 5.68585 4.0365 4.19586C5.26723 2.96514 6.43425 2.14212 8.32402 1.77333C9.71668 1.50154 11.0394 2.21001 11.9946 2.91413Z"
                        fill="currentColor"
                      />
                    </svg>
                  </span>
                  <span className="text-sm text-gray-700">
                    <a className="hover:underline" href="tel:08074533441">
                      0807 453 3441
                    </a>
                    ,{" "}
                    <a className="hover:underline" href="tel:08034160001">
                      0803 416 0001
                    </a>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#EF1111] mt-1 flex-shrink-0">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 30 30"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M10.4956 3.75H19.5044C20.882 3.74999 21.9931 3.74998 22.8923 3.82466C23.8183 3.90156 24.6311 4.06407 25.3811 4.45367C26.5226 5.04664 27.4534 5.97739 28.0463 7.11891C28.4359 7.86892 28.5984 8.68168 28.6753 9.6077C28.75 10.507 28.75 11.618 28.75 12.9956V17.0044C28.75 18.382 28.75 19.493 28.6753 20.3923C28.5984 21.3183 28.4359 22.1311 28.0463 22.8811C27.4534 24.0226 26.5226 24.9534 25.3811 25.5463C24.6311 25.9359 23.8183 26.0984 22.8923 26.1753C21.993 26.25 20.882 26.25 19.5044 26.25H10.4956C9.11805 26.25 8.00696 26.25 7.1077 26.1753C6.18168 26.0984 5.36892 25.9359 4.61891 25.5463C3.47739 24.9534 2.54664 24.0226 1.95367 22.8811C1.56407 22.1311 1.40156 21.3183 1.32466 20.3923C1.24998 19.4931 1.24999 18.382 1.25 17.0044V12.9956C1.24999 11.618 1.24998 10.5069 1.32466 9.6077C1.40156 8.68168 1.56407 7.86892 1.95367 7.11891C2.54664 5.97739 3.47739 5.04664 4.61891 4.45367C5.36892 4.06407 6.18168 3.90156 7.1077 3.82466C8.00695 3.74998 9.11803 3.74999 10.4956 3.75ZM6.56592 6.41313C7.62673 6.66202 8.61147 7.1895 9.41272 7.95259L13.0862 11.4511C13.5942 11.935 13.9218 12.2456 14.1904 12.4627C14.4469 12.6701 14.5676 12.7225 14.6344 12.743C14.8727 12.8158 15.1273 12.8158 15.3656 12.743C15.4324 12.7225 15.5532 12.6701 15.8097 12.4627C16.0782 12.2456 16.4058 11.935 16.9138 11.4511L20.5873 7.95259C21.3885 7.1895 22.3733 6.66202 23.4341 6.41313C23.224 6.37279 22.9785 6.34042 22.6854 6.31608C21.9018 6.25101 20.8947 6.25 19.45 6.25H10.55C9.10529 6.25 8.0982 6.25101 7.31461 6.31608C7.02146 6.34042 6.77597 6.37279 6.56592 6.41313ZM26.0132 8.75H24.8438C23.9009 8.75 22.9942 9.11269 22.3114 9.76293L18.6035 13.2943C18.1397 13.736 17.7385 14.1182 17.3814 14.4069C17.0034 14.7125 16.595 14.9813 16.0967 15.1337C15.3819 15.3523 14.6181 15.3523 13.9033 15.1337C13.405 14.9813 12.9966 14.7125 12.6186 14.4069C12.2615 14.1182 11.8603 13.736 11.3965 13.2943L7.68858 9.76293C7.00582 9.11269 6.0991 8.75 5.15625 8.75H3.98677C3.91074 9.0208 3.85379 9.36052 3.81608 9.81461C3.75101 10.5982 3.75 11.6053 3.75 13.05V16.95C3.75 18.3947 3.75101 19.4018 3.81608 20.1854C3.87991 20.954 3.99886 21.395 4.1722 21.7287C4.52798 22.4136 5.08643 22.972 5.77135 23.3278C6.10503 23.5011 6.54597 23.6201 7.31461 23.6839C8.0982 23.749 9.10529 23.75 10.55 23.75H19.45C20.8947 23.75 21.9018 23.749 22.6854 23.6839C23.454 23.6201 23.895 23.5011 24.2287 23.3278C24.9136 22.972 25.472 22.4136 25.8278 21.7287C26.0011 21.395 26.1201 20.954 26.1839 20.1854C26.249 19.4018 26.25 18.3947 26.25 16.95V13.05C26.25 11.6053 26.249 10.5982 26.1839 9.81461C26.1462 9.36052 26.0893 9.0208 26.0132 8.75Z"
                        fill="currentColor"
                      />
                    </svg>
                  </span>
                  <a
                    className="hover:underline text-sm text-gray-700"
                    href="mailto:info@dximarketing.com"
                  >
                    info@dximarketing.com
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Side - Concepts Grid */}
          <div className="w-full lg:w-2/3 bg-gray-100 p-6 lg:p-8 overflow-y-auto lg:max-h-7xl hide-scrollbar">
          {concepts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {concepts.map((concept: any) => (
                <ConceptCard key={concept._id} concept={concept} />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>No concepts available yet.</p>
            </div>
          )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
