import { BookOpen, GraduationCap, Award } from 'lucide-react';

export function Learning() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Learning & Development</h1>
          <p className="text-sm text-slate-500 mt-1">Training programs, courses, and certifications.</p>
        </div>
        <div className="flex gap-4">
           <button className="flex items-center px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded hover:bg-slate-50">
            <BookOpen className="w-4 h-4 mr-2" />
            Course Catalog
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
         <GraduationCap className="w-12 h-12 text-blue-500 mx-auto mb-4" />
         <h2 className="text-lg font-bold text-slate-800">L&D Portal</h2>
         <p className="text-slate-500 text-sm mt-2 max-w-lg mx-auto">
           Manage employee upskilling, track mandatory compliance training (e.g., Data Privacy, Safety), and assign career growth paths.
         </p>
         <button className="mt-6 px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded hover:bg-slate-800">
            Initialize Module
         </button>
      </div>

    </div>
  );
}
