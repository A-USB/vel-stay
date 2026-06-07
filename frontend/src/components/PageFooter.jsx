export default function PageFooter() {
  return (
    <footer className="border-t border-gray-100 bg-[#f0f2f0] py-5 px-8 mt-auto">
      <div className="flex flex-col items-center gap-1.5">
        <div className="flex gap-8 text-xs text-[#bbb]">
          <a href="#" className="hover:text-[#0d6644] transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-[#0d6644] transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-[#0d6644] transition-colors">Contact Support</a>
        </div>
        <p className="text-[11px] text-[#ccc]">© 2026 RestoHost Management Systems. All rights reserved.</p>
      </div>
    </footer>
  );
}
