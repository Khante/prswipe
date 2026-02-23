import { motion } from "framer-motion";

export function LoadingCard({ imageSrc }: { imageSrc?: string }) {
  const imgSrc = imageSrc || "/static/loading/beach.png";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md rounded-2xl overflow-hidden relative h-[520px]"
      style={{
        backgroundColor: "#1a1a28",
      }}
    >
      <style>
        {`
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.3); }
          }
        `}
      </style>

      {/* Rainbow gradient top border */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#ff1744] via-[#ffd700] to-[#00e676] z-50" />

      {/* Hero image - z-index 0 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "55%",
          backgroundImage: `url(${imgSrc})`,
          backgroundSize: "cover",
          backgroundPosition: "center top",
          zIndex: 0,
        }}
      />

      {/* Gradient fade from image into content - z-index 1 */}
      <div
        className="absolute"
        style={{
          bottom: 0,
          left: 0,
          right: 0,
          height: "15%",
          background: "linear-gradient(to top, #1a1a28 0%, transparent 100%)",
          zIndex: 1,
        }}
      />

      {/* Backdrop gradient behind text */}
      <div
        className="absolute"
        style={{
          bottom: 0,
          left: 0,
          right: 0,
          height: "50%",
          background:
            "linear-gradient(to top, rgba(10,10,15,0.95) 0%, transparent 100%)",
          zIndex: 2,
        }}
      />

      {/* Content overlay - z-index 3 */}
      <div
        className="absolute flex flex-col items-center justify-end w-full"
        style={{
          bottom: 0,
          left: 0,
          right: 0,
          height: "50%",
          zIndex: 3,
          padding: "32px 24px 24px 24px",
        }}
      >
        <p
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(1.2rem, 3.5vw, 1.6rem)",
            letterSpacing: "-0.02em",
            background:
              "linear-gradient(90deg, #ffffff 0%, #00e676 60%, #ffd700 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            filter: "drop-shadow(0 0 20px rgba(0,230,118,0.3))",
            textAlign: "center",
          }}
        >
          Finding local hot PRs in your area
        </p>

        <div className="flex gap-1 mt-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                color: "#00e676",
                fontSize: "2rem",
                display: "inline-block",
                animation: "pulse 1.2s ease-in-out infinite",
                animationDelay: `${i * 0.15}s`,
              }}
            >
              .
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
