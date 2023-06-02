export default function Page() {
  return (
    <form className="flex flex-col gap-3 overflow-hidden p-6 self-center bg-white rounded-lg shadow-md">
      <h1 className="text-xl font-semibold text-center">Sign in</h1>
      <input
        name="username"
        id="username"
        type="text"
        autoComplete="username"
        placeholder="User Name *"
        className="block w-full px-4 py-2 mt-2 text-purple-700 bg-white border rounded-md focus:border-purple-400 focus:ring-purple-300 focus:outline-none focus:ring focus:ring-opacity-40"
        required
      />
      <input
        name="password"
        id="password"
        type="password"
        autoComplete="current-password"
        placeholder="Password *"
        className="block w-full px-4 py-2 mt-2 text-purple-700 bg-white border rounded-md focus:border-purple-400 focus:ring-purple-300 focus:outline-none focus:ring focus:ring-opacity-40"
        required
      />
      <div>
        <button className="mt-3 w-full px-4 py-2 tracking-wide text-white transition-colors duration-200 transform bg-purple-700 rounded-md hover:bg-purple-600 focus:outline-none focus:bg-purple-600">
          Login
        </button>
      </div>
    </form>
  );
}
