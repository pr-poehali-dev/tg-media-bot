import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Icon from '@/components/ui/icon';

const activityData = [
  { date: '01.01', requests: 245, users: 89, videos: 152, photos: 93 },
  { date: '02.01', requests: 312, users: 124, videos: 201, photos: 111 },
  { date: '03.01', requests: 287, users: 98, videos: 178, photos: 109 },
  { date: '04.01', requests: 356, users: 145, videos: 223, photos: 133 },
  { date: '05.01', requests: 298, users: 117, videos: 189, photos: 109 },
  { date: '06.01', requests: 423, users: 167, videos: 267, photos: 156 },
  { date: '07.01', requests: 389, users: 142, videos: 241, photos: 148 },
];

const contentTypeData = [
  { name: 'Видео', value: 1451, color: '#0EA5E9' },
  { name: 'Фото', value: 859, color: '#8E9196' },
  { name: 'Истории', value: 342, color: '#1A1F2C' },
  { name: 'Анализ', value: 156, color: '#F1F0FB' },
];

const usersData = [
  { id: 1, username: '@user_123', requests: 45, status: 'active', lastActive: '2 мин назад', premium: true },
  { id: 2, username: '@anna_dev', requests: 23, status: 'active', lastActive: '15 мин назад', premium: false },
  { id: 3, username: '@tech_pro', requests: 67, status: 'active', lastActive: '1 час назад', premium: true },
  { id: 4, username: '@user_456', requests: 12, status: 'blocked', lastActive: '3 дня назад', premium: false },
  { id: 5, username: '@media_king', requests: 89, status: 'active', lastActive: '5 мин назад', premium: true },
  { id: 6, username: '@simple_user', requests: 8, status: 'active', lastActive: '2 часа назад', premium: false },
];

const logsData = [
  { time: '14:32:45', user: '@user_123', action: 'Скачивание видео', status: 'success', details: 'video_12345.mp4' },
  { time: '14:31:23', user: '@anna_dev', action: 'Просмотр истории', status: 'success', details: 'story_from_channel' },
  { time: '14:29:12', user: '@tech_pro', action: 'Анализ профиля', status: 'success', details: 'profile_scan_completed' },
  { time: '14:28:56', user: '@user_456', action: 'Скачивание фото', status: 'error', details: 'access_denied' },
  { time: '14:27:34', user: '@media_king', action: 'Скачивание видео', status: 'success', details: 'video_67890.mp4' },
];

export default function Index() {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed left-0 top-0 h-full w-64 bg-sidebar border-r border-sidebar-border">
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="Bot" className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-sidebar-foreground font-semibold text-lg">TG Bot Admin</h1>
              <p className="text-sidebar-foreground/60 text-xs">Панель управления</p>
            </div>
          </div>
        </div>
        
        <nav className="p-4 space-y-1">
          <Button variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent">
            <Icon name="LayoutDashboard" className="mr-3" size={20} />
            Дашборд
          </Button>
          <Button variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent">
            <Icon name="Users" className="mr-3" size={20} />
            Пользователи
          </Button>
          <Button variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent">
            <Icon name="FileText" className="mr-3" size={20} />
            Логи
          </Button>
          <Button variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent">
            <Icon name="Shield" className="mr-3" size={20} />
            Модерация
          </Button>
          <Button variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent">
            <Icon name="BarChart3" className="mr-3" size={20} />
            Аналитика
          </Button>
          <Button variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent">
            <Icon name="Settings" className="mr-3" size={20} />
            Настройки
          </Button>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-semibold">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sidebar-foreground text-sm font-medium truncate">Admin</p>
              <p className="text-sidebar-foreground/60 text-xs">admin@bot.com</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="ml-64 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Дашборд</h1>
              <p className="text-muted-foreground mt-1">Статистика и управление Telegram ботом</p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">За день</SelectItem>
                  <SelectItem value="week">За неделю</SelectItem>
                  <SelectItem value="month">За месяц</SelectItem>
                </SelectContent>
              </Select>
              <Button>
                <Icon name="Download" className="mr-2" size={16} />
                Экспорт
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Всего запросов</CardTitle>
                <Icon name="Activity" className="text-primary" size={20} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">2,310</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-green-600 font-medium">+12.5%</span> от предыдущей недели
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Активных пользователей</CardTitle>
                <Icon name="Users" className="text-primary" size={20} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">782</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-green-600 font-medium">+8.3%</span> от предыдущей недели
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Скачано файлов</CardTitle>
                <Icon name="Download" className="text-primary" size={20} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">1,451</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-green-600 font-medium">+15.2%</span> от предыдущей недели
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Заблокировано</CardTitle>
                <Icon name="Shield" className="text-destructive" size={20} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">23</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-red-600 font-medium">+4</span> за последние 24 часа
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Активность бота</CardTitle>
                <CardDescription>Запросы и пользователи за последние 7 дней</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="date" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip />
                    <Line type="monotone" dataKey="requests" stroke="#0EA5E9" strokeWidth={2} />
                    <Line type="monotone" dataKey="users" stroke="#8E9196" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Типы контента</CardTitle>
                <CardDescription>Распределение по категориям</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={contentTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {contentTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Загрузки контента</CardTitle>
              <CardDescription>Видео и фото за последние 7 дней</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip />
                  <Bar dataKey="videos" fill="#0EA5E9" />
                  <Bar dataKey="photos" fill="#8E9196" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Tabs defaultValue="users" className="w-full">
            <TabsList>
              <TabsTrigger value="users">
                <Icon name="Users" className="mr-2" size={16} />
                Пользователи
              </TabsTrigger>
              <TabsTrigger value="logs">
                <Icon name="FileText" className="mr-2" size={16} />
                Логи
              </TabsTrigger>
              <TabsTrigger value="moderation">
                <Icon name="Shield" className="mr-2" size={16} />
                Модерация
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Управление пользователями</CardTitle>
                      <CardDescription>Список активных и заблокированных пользователей</CardDescription>
                    </div>
                    <Input
                      placeholder="Поиск по username..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="max-w-xs"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>Запросов</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead>Premium</TableHead>
                        <TableHead>Последняя активность</TableHead>
                        <TableHead>Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usersData.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.id}</TableCell>
                          <TableCell>{user.username}</TableCell>
                          <TableCell>{user.requests}</TableCell>
                          <TableCell>
                            <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                              {user.status === 'active' ? 'Активен' : 'Заблокирован'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {user.premium ? (
                              <Badge className="bg-amber-500">Premium</Badge>
                            ) : (
                              <Badge variant="outline">Free</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground">{user.lastActive}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm">
                                <Icon name="Eye" size={16} />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Icon name="Ban" size={16} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="logs" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Логи активности</CardTitle>
                  <CardDescription>Последние действия пользователей</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Время</TableHead>
                        <TableHead>Пользователь</TableHead>
                        <TableHead>Действие</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead>Детали</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logsData.map((log, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-mono text-sm">{log.time}</TableCell>
                          <TableCell>{log.user}</TableCell>
                          <TableCell>{log.action}</TableCell>
                          <TableCell>
                            <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                              {log.status === 'success' ? 'Успешно' : 'Ошибка'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">{log.details}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="moderation" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Система модерации</CardTitle>
                  <CardDescription>Обнаружение ботов и подозрительной активности</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Icon name="AlertTriangle" className="text-amber-500" size={24} />
                        <div>
                          <p className="font-medium">Подозрительная активность обнаружена</p>
                          <p className="text-sm text-muted-foreground">@user_456 - необычный паттерн запросов</p>
                        </div>
                      </div>
                      <Button variant="outline">Проверить</Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Icon name="Bot" className="text-red-500" size={24} />
                        <div>
                          <p className="font-medium">Возможный бот-аккаунт</p>
                          <p className="text-sm text-muted-foreground">@spam_bot_123 - автоматические запросы</p>
                        </div>
                      </div>
                      <Button variant="destructive">Заблокировать</Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Icon name="CheckCircle2" className="text-green-500" size={24} />
                        <div>
                          <p className="font-medium">Система работает нормально</p>
                          <p className="text-sm text-muted-foreground">Подозрительной активности не обнаружено</p>
                        </div>
                      </div>
                      <Badge variant="outline">Активно</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
