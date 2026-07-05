import UserRelationPage from "@/pages/settings/UserRelationPage";

const FavoritesPage = () => (
  <UserRelationPage
    title="Favourite creators"
    description="Pin the accounts you always want to see first"
    emptyText="Add favourites and their new uploads will jump to the top of Explore."
    table="favorites"
    ownerColumn="user_id"
    targetColumn="favorite_id"
    addLabel="Favourite"
    removeLabel="Remove"
  />
);

export default FavoritesPage;
