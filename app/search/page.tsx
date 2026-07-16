import getSongsByTitle from "@/actions/getSongsByTitle";
import SearchInput from "@/components/SearchInput";
import Header from "@/components/Header";

import SearchContent from "./components/SearchContent";

export const revalidate = 0;

interface SearchProps {
  searchParams: { title: string }
};

const Search = async ({ searchParams }: SearchProps) => {
  const songs = await getSongsByTitle(searchParams.title);

  return (
    <div 
      className="
        bg-neutral-950/65 
        backdrop-blur-xl 
        border 
        border-neutral-800/40 
        rounded-2xl 
        h-full 
        w-full 
        overflow-hidden 
        overflow-y-auto
        shadow-2xl
      "
    >
      <Header className="from-neutral-950/40">
        <div className="mb-2 flex flex-col gap-y-6">
          <h1 className="text-white text-3xl font-semibold">
            Search
          </h1>
          <SearchInput />
        </div>
      </Header>
      <SearchContent songs={songs} />
    </div>
  );
}

export default Search;
