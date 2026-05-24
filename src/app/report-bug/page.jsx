"use client";
import React from "react";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

const BugReportPage = () => {
  return (
    <div className="w-full bg-white min-h-screen pt-20 pb-20">
      <div className="max-w-3xl mx-auto px-4 md:px-6">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-block mb-6">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center border border-red-100">
              <span className="text-3xl">🐛</span>
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-black font-creato mb-6 leading-tight">
            Help Us Build Better
          </h1>
          <p className="text-xl text-gray-600 font-creato max-w-2xl mx-auto mb-8">
            Found a bug? We&apos;d love to hear about it.
          </p>
        </div>

        {/* Story Section */}
        <div className="mb-16 bg-linear-to-br from-gray-50 to-white border border-gray-100 rounded-3xl p-8 md:p-12">
          <div className="space-y-6 text-lg text-gray-700 leading-relaxed font-creato">
            <p>
              Hey there! 👋 I&apos;m the solo founder of Vichento, and I&apos;m
              building this platform with passion. We&apos;re brand new, and
              like every new venture, we&apos;re not perfect.
            </p>

            <p>
              This is a one-person operation right now, which means I&apos;m
              wearing all the hats&mdash;coding, designing, testing, and
              everything in between. That also means bugs will happen. Features
              might not work as expected. The experience might feel rough around
              the edges sometimes.
            </p>

            <p className="font-semibold text-black">
              But here&apos;s the thing:{" "}
              <span className="text-red-600">I care deeply about quality</span>,
              and I need your help to make Vichento better.
            </p>

            <p>
              Every bug report you submit is invaluable. It helps me understand
              what&apos;s breaking, what&apos;s confusing, and what needs
              improvement. Your feedback directly shapes how this platform
              evolves.
            </p>

            <p>
              Whether it&apos;s a typo, a broken button, a confusing flow, or a
              completely broken feature&mdash;
              <span className="font-semibold">please report it</span>. The more
              specific you can be, the faster I can fix it.
            </p>

            <p className="border-l-4 border-red-600 pl-6 italic">
              &ldquo;Every bug fixed makes Vichento stronger. Every report you
              file makes you part of this journey.&rdquo;
            </p>

            <p className="text-base text-gray-600">
              Thank you for being part of building something special. Let&apos;s
              squash these bugs together! 🚀
            </p>
          </div>
        </div>

        {/* Features Section */}
        {/* <div className="mb-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 border border-gray-100 rounded-2xl">
            <div className="text-3xl mb-4">📝</div>
            <h3 className="text-lg font-semibold text-black mb-2 font-creato">
              Detailed Reports
            </h3>
            <p className="text-sm text-gray-600">
              Share exactly what went wrong, when it happened, and how to
              reproduce it.
            </p>
          </div>
          <div className="p-6 border border-gray-100 rounded-2xl">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="text-lg font-semibold text-black mb-2 font-creato">
              Fast Response
            </h3>
            <p className="text-sm text-gray-600">
              I personally review each report and work on fixes as quickly as
              possible.
            </p>
          </div>
          <div className="p-6 border border-gray-100 rounded-2xl">
            <div className="text-3xl mb-4">🎯</div>
            <h3 className="text-lg font-semibold text-black mb-2 font-creato">
              Direct Impact
            </h3>
            <p className="text-sm text-gray-600">
              Your bug reports directly influence what I work on next.
            </p>
          </div>
        </div> */}

        {/* CTA Section */}
        <div className="text-center">
          <Link
            href="/report-bug/submit"
            className="inline-flex items-center gap-3 px-8 py-4 bg-black text-white rounded-full text-lg font-semibold font-creato hover:bg-gray-800 transition-colors duration-200 cursor-pointer"
          >
            Report a Bug
            <ArrowRightIcon className="w-5 h-5" />
          </Link>
        </div>

        {/* Footer Note */}
        <div className="mt-16 text-center text-sm text-gray-500 font-creato">
          <p>
            We take all reports seriously. Thank you for helping us improve! 🙏
          </p>
        </div>
      </div>
    </div>
  );
};

export default BugReportPage;
