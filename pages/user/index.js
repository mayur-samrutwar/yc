import React from 'react';
import { Button } from "@/components/ui/button";
import Navbar from '@/components/Navbar';

const CourseCard = ({ title, instructor, videoId, rating, students, category }) => (
  <div className="group">
    <div className="relative">
      <div className="w-full aspect-video rounded-lg overflow-hidden">
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${videoId}`}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button className="bg-white hover:bg-gray-100 text-black px-6">Register Now</Button>
        </div>
      </div>
      <span className="absolute top-2 right-2 bg-black text-white text-xs px-2 py-1 rounded-full">
        {category}
      </span>
    </div>
    <div className="mt-3">
      <h3 className="font-medium text-base mb-1 line-clamp-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-1">{instructor}</p>
      <div className="flex items-center text-sm text-gray-600">
        <div className="flex items-center">
          <span className="text-yellow-400">★</span>
          <span className="ml-1">{rating}</span>
        </div>
        <span className="mx-2">•</span>
        <span>{students} students</span>
      </div>
    </div>
  </div>
);

export default function User() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Trending Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Trending Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <CourseCard 
                key={i}
                title="Advanced Web Development with React & Next.js"
                instructor="John Doe"
                videoId="salY_Sm6mv4"
                rating="4.8"
                students="12,345"
                category="Trending"
              />
            ))}
          </div>
        </section>

        {/* Category Sections */}
        {['STEM', 'WEB3', 'ART'].map((category) => (
          <section key={category} className="mb-12">
            <h2 className="text-2xl font-bold mb-6">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <CourseCard 
                  key={i}
                  title={`${category} Course ${i}`}
                  instructor="Jane Smith"
                  videoId="salY_Sm6mv4"
                  rating="4.5"
                  students="8,234"
                  category={category}
                />
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}