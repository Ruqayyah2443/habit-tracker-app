export default function SplashScreen() {
  return (
    <div
      data-testid="splash-screen"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4f46e5',
        color: 'white',
      }}
    >
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>
        Habit Tracker
      </h1>
      <p style={{ marginTop: '8px', opacity: 0.8 }}>
        Building better habits daily
      </p>
    </div>
  );
}
