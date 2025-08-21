import {useEffect, useState} from 'react';
import { Card, CardContent } from '@/shared/ui/ui/card';
import { Button } from '@/shared/ui/ui/button';
import { Input } from '@/shared/ui/ui/input';
import {Avatar, AvatarFallback, AvatarImage} from '@/shared/ui/ui/avatar';
import { UserModal } from '@/shared/ui/UserModal';
import { userApi } from "@/entities/user/api";
import { User } from "@/entities/user";

export function FriendsPage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const USERS_PER_PAGE = 30;

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    userApi.getAllUsers(currentPage, USERS_PER_PAGE)
      .then((fetchedUsers) => {
        if (Array.isArray(fetchedUsers)) {
          setUsers(fetchedUsers);
        } else {
          setUsers([]);
        }
      })
      .catch(() => {
        setError('Ошибка загрузки пользователей');
        setUsers([]);
      })
      .finally(() => setIsLoading(false));
  }, [currentPage]);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  const handleNextPage = () => {
    if (users.length === USERS_PER_PAGE) setCurrentPage(currentPage + 1);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Improved filter users by name (firstName, lastName, name)
  const filteredUsers = users.filter(user => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    const firstName = (user.firstName || '').toLowerCase();
    const lastName = (user.lastName || '').toLowerCase();
    const name = (user.name || '').toLowerCase();
    const fullName = `${firstName} ${lastName}`.trim();
    return (
      firstName.includes(query) ||
      lastName.includes(query) ||
      name.includes(query) ||
      fullName.includes(query)
    );
  });

  const openUserProfile = (user: User) => {
    setSelectedUser(user);
    setIsProfileModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between mb-4">
        <h2 className="text-xl font-semibold mb-1">Пользователи</h2>
        <Input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Поиск по имени..."
          className="w-64"
        />
      </div>
      <div>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : (
          <div className="space-y-2">
            {Array.isArray(filteredUsers) && filteredUsers.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">Пользователи не найдены</div>
            ) : (
              filteredUsers.map((user) => (
                <Card key={user.id} className="mb-2">
                  <CardContent className="flex items-center gap-3 p-3">
                    <div className="cursor-pointer" onClick={() => openUserProfile(user)}>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>
                          {(user.firstName || user.name || '').charAt(0)}{(user.lastName || '').charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1 cursor-pointer" onClick={() => openUserProfile(user)}>
                      <div className="font-medium">{user.firstName || user.name} {user.lastName}</div>
                      <div className="text-xs text-muted-foreground">Уровень {user.level} • {user.city}</div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => openUserProfile(user)}>
                      Профиль
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
        <Button onClick={handlePrevPage} disabled={currentPage === 1 || isLoading}>Назад</Button>
        <span style={{ margin: '0 12px' }}>Страница {currentPage}</span>
        <Button onClick={handleNextPage} disabled={users.length < USERS_PER_PAGE || isLoading}>Вперёд</Button>
      </div>
      <UserModal
        user={selectedUser}
        isOpen={isProfileModalOpen}
        onClose={() => {
          setIsProfileModalOpen(false);
          setSelectedUser(null);
        }}
      />
    </div>
  );
}
