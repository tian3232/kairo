<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\ExploreController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\AnimeController;
use App\Http\Controllers\WatchController;
use App\Http\Controllers\UserListController;
use App\Http\Controllers\SimulcastController;


Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/explore', [ExploreController::class, 'index'])->name('explore');
Route::get('/simulcast', [SimulcastController::class, 'index'])->name('simulcast');
Route::get('/anime/{anime:slug}', [AnimeController::class, 'show'])->name('anime.show');

Route::get('/terminos', fn () => Inertia::render('legal/terms'))->name('legal.terms');
Route::get('/privacidad', fn () => Inertia::render('legal/privacy'))->name('legal.privacy');
Route::get('/dmca', fn () => Inertia::render('legal/dmca'))->name('legal.dmca');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return redirect()->route('home');
    })->name('dashboard');

    Route::get('/watch/{episode}', [WatchController::class, 'show'])->name('watch.show');
    Route::post('/watch/{episode}/progress', [WatchController::class, 'updateProgress'])->name('watch.progress');
    Route::post('/watch/{episode}/mark-watched', [WatchController::class, 'markAsWatched'])->name('watch.mark-watched');

    Route::post('/anime/{anime}/watchlist', [UserListController::class, 'toggleWatchlist'])->name('anime.watchlist');
    Route::post('/anime/{anime}/favorite', [UserListController::class, 'toggleFavorite'])->name('anime.favorite');
    Route::get('/mi-lista', [UserListController::class, 'watchlist'])->name('user.watchlist');
    Route::get('/favoritos', [UserListController::class, 'favorites'])->name('user.favorites');
    Route::get('/historial', [UserListController::class, 'history'])->name('user.history');
    Route::delete('/historial/{episode}', [UserListController::class, 'destroyHistory'])->name('user.history.destroy');
    Route::post('/historial/bulk-delete', [UserListController::class, 'destroyHistoryBulk'])->name('user.history.bulk-delete');

    // Custom Lists
    Route::get('/mis-listas', [UserListController::class, 'indexLists'])->name('user.lists');
    Route::post('/mis-listas', [UserListController::class, 'createList'])->name('user.lists.create');
    Route::put('/mis-listas/{list}', [UserListController::class, 'updateList'])->name('user.lists.update');
    Route::post('/mis-listas/{list}/cover', [UserListController::class, 'updateListCover'])->name('user.lists.cover');
    Route::delete('/mis-listas/{list}', [UserListController::class, 'deleteList'])->name('user.lists.delete');
    Route::post('/mis-listas/{list}/anime', [UserListController::class, 'addAnime'])->name('user.lists.add-anime');
    Route::delete('/mis-listas/{list}/anime/{anime}', [UserListController::class, 'removeAnime'])->name('user.lists.remove-anime');
    Route::post('/api/lists/toggle-anime', [UserListController::class, 'toggleAnime'])->name('user.lists.toggle-anime');
    Route::get('/api/lists/anime', [UserListController::class, 'listsForAnime'])->name('user.lists.for-anime');
    Route::put('/mis-listas/{list}/reorder', [UserListController::class, 'reorder'])->name('user.lists.reorder');

    Route::post('/comments', [\App\Http\Controllers\CommentController::class, 'store'])->name('comments.store');
    Route::put('/comments/{comment}', [\App\Http\Controllers\CommentController::class, 'update'])->name('comments.update');
    Route::delete('/comments/{comment}', [\App\Http\Controllers\CommentController::class, 'destroy'])->name('comments.destroy');
    Route::post('/comments/{comment}/like', [\App\Http\Controllers\CommentController::class, 'toggleLike'])->name('comments.like');
    Route::get('/comments/{comment}/replies', [\App\Http\Controllers\CommentController::class, 'replies'])->name('comments.replies');
    Route::post('/comments/{comment}/report', [\App\Http\Controllers\CommentController::class, 'report'])->name('comments.report');

    Route::post('/ratings', [\App\Http\Controllers\RatingController::class, 'store'])->name('ratings.store');
    Route::delete('/ratings/{rating}', [\App\Http\Controllers\RatingController::class, 'destroy'])->name('ratings.destroy');

    Route::post('/episodes/{episode}/favorite', [\App\Http\Controllers\EpisodeFavoriteController::class, 'toggle'])->name('episode.favorite');

    Route::get('/mi-calendario', [\App\Http\Controllers\CalendarController::class, 'myCalendar'])->name('user.my-calendar');

    Route::get('/notifications', [\App\Http\Controllers\NotificationsController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/{notification}/read', [\App\Http\Controllers\NotificationsController::class, 'markRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [\App\Http\Controllers\NotificationsController::class, 'markAllRead'])->name('notifications.read-all');
    Route::post('/notifications/{notification}/accept-friend', [\App\Http\Controllers\NotificationsController::class, 'acceptFriend'])->name('notifications.accept-friend');
    Route::post('/notifications/{notification}/reject-friend', [\App\Http\Controllers\NotificationsController::class, 'rejectFriend'])->name('notifications.reject-friend');

    Route::get('/perfil/{user}', [\App\Http\Controllers\ProfileController::class, 'show'])->name('profile.show');
    Route::put('/perfil/bio', [\App\Http\Controllers\ProfileController::class, 'updateBio'])->name('profile.update-bio');
    Route::put('/perfil/privacidad', [\App\Http\Controllers\ProfileController::class, 'updatePrivacy'])->name('profile.update-privacy');
    Route::post('/perfil/{user}/comentar', [\App\Http\Controllers\ProfileController::class, 'comment'])->name('profile.comment');
    Route::delete('/perfil/comentario/{comment}', [\App\Http\Controllers\ProfileController::class, 'deleteComment'])->name('profile.delete-comment');
    Route::post('/perfil/{user}/amigar', [\App\Http\Controllers\ProfileController::class, 'sendFriendRequest'])->name('profile.friend-request');
    Route::post('/amistad/{friendship}/aceptar', [\App\Http\Controllers\ProfileController::class, 'acceptFriend'])->name('friendship.accept');
    Route::post('/amistad/{friendship}/rechazar', [\App\Http\Controllers\ProfileController::class, 'rejectFriend'])->name('friendship.reject');
    Route::delete('/amistad/{user}', [\App\Http\Controllers\ProfileController::class, 'removeFriend'])->name('friendship.remove');

    Route::get('/mensajes', [\App\Http\Controllers\MessageController::class, 'index'])->name('messages.index');
    Route::get('/messages/api', [\App\Http\Controllers\MessageController::class, 'apiIndex'])->name('messages.api');
    Route::post('/messages', [\App\Http\Controllers\MessageController::class, 'store'])->name('messages.store');
    Route::post('/messages/mark-read', [\App\Http\Controllers\MessageController::class, 'markRead'])->name('messages.mark-read');
    Route::put('/messages/{message}', [\App\Http\Controllers\MessageController::class, 'update'])->name('messages.update');
    Route::delete('/messages/{message}', [\App\Http\Controllers\MessageController::class, 'destroy'])->name('messages.destroy');

    Route::get('/test-player', function () {
    return Inertia::render('TestPlayer');
});
});

Route::get('/calendario', [\App\Http\Controllers\CalendarController::class, 'index'])->name('user.calendar');
Route::get('/api/search', [\App\Http\Controllers\SearchController::class, 'search'])->name('api.search');
Route::post('/api/check-username', [\App\Http\Controllers\ValidationController::class, 'checkUsername'])->name('api.check-username');
Route::post('/api/check-email', [\App\Http\Controllers\ValidationController::class, 'checkEmail'])->name('api.check-email');

    Route::middleware('auth')->get('/api/check-verification', function () {
        return response()->json(['verified' => auth()->user()->hasVerifiedEmail()]);
    });

    Route::middleware('auth')->get('/api/unread-counts', \App\Http\Controllers\UnreadCountsController::class)->name('api.unread-counts');

    Route::post('/api/support', [\App\Http\Controllers\SupportController::class, 'store'])->name('support.store');

Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [\App\Http\Controllers\Admin\AdminController::class, 'index'])->name('dashboard');

    Route::get('/audit-logs', [\App\Http\Controllers\Admin\AuditController::class, 'index'])->name('audit-logs');

    Route::resource('/genres', \App\Http\Controllers\Admin\GenreController::class)->except(['create', 'show', 'edit']);
    Route::resource('/studios', \App\Http\Controllers\Admin\StudioController::class)->except(['create', 'show', 'edit']);

    Route::get('/animes', [\App\Http\Controllers\Admin\AnimeController::class, 'index'])->name('animes.index');
    Route::get('/animes/create', [\App\Http\Controllers\Admin\AnimeController::class, 'create'])->name('animes.create');
    Route::post('/animes', [\App\Http\Controllers\Admin\AnimeController::class, 'store'])->name('animes.store');
    Route::get('/animes/{anime}/edit', [\App\Http\Controllers\Admin\AnimeController::class, 'edit'])->name('animes.edit');
    Route::put('/animes/{anime}', [\App\Http\Controllers\Admin\AnimeController::class, 'update'])->name('animes.update');
    Route::delete('/animes/{anime}', [\App\Http\Controllers\Admin\AnimeController::class, 'destroy'])->name('animes.destroy');
    Route::post('/animes/{anime}/toggle-active', [\App\Http\Controllers\Admin\AnimeController::class, 'toggleActive'])->name('animes.toggle-active');

    Route::get('/animes/{anime}/seasons', [\App\Http\Controllers\Admin\SeasonController::class, 'index'])->name('seasons.index');
    Route::post('/animes/{anime}/seasons', [\App\Http\Controllers\Admin\SeasonController::class, 'store'])->name('seasons.store');
    Route::put('/seasons/{season}', [\App\Http\Controllers\Admin\SeasonController::class, 'update'])->name('seasons.update');
    Route::delete('/seasons/{season}', [\App\Http\Controllers\Admin\SeasonController::class, 'destroy'])->name('seasons.destroy');
    Route::post('/seasons/{season}/episodes', [\App\Http\Controllers\Admin\SeasonController::class, 'storeEpisode'])->name('episodes.store');
    Route::put('/episodes/{episode}', [\App\Http\Controllers\Admin\SeasonController::class, 'updateEpisode'])->name('episodes.update');
    Route::delete('/episodes/{episode}', [\App\Http\Controllers\Admin\SeasonController::class, 'destroyEpisode'])->name('episodes.destroy');

    Route::get('/banners', [\App\Http\Controllers\Admin\BannerController::class, 'index'])->name('banners.index');
    Route::post('/banners', [\App\Http\Controllers\Admin\BannerController::class, 'store'])->name('banners.store');
    Route::post('/banners/{banner}/toggle-active', [\App\Http\Controllers\Admin\BannerController::class, 'toggleActive'])->name('banners.toggle-active');
    Route::delete('/banners/{banner}', [\App\Http\Controllers\Admin\BannerController::class, 'destroy'])->name('banners.destroy');
    Route::post('/banners/reorder', [\App\Http\Controllers\Admin\BannerController::class, 'reorder'])->name('banners.reorder');

    Route::get('/users', [\App\Http\Controllers\Admin\UserController::class, 'index'])->name('users.index');
    Route::post('/users/{user}/toggle-role', [\App\Http\Controllers\Admin\UserController::class, 'toggleRole'])->name('users.toggle-role');
    Route::delete('/users/{user}', [\App\Http\Controllers\Admin\UserController::class, 'destroy'])->name('users.destroy');

    Route::get('/comments', [\App\Http\Controllers\Admin\CommentController::class, 'index'])->name('comments.index');
    Route::get('/comments/reports', [\App\Http\Controllers\Admin\CommentController::class, 'reports'])->name('comments.reports');
    Route::post('/comments/reports/{report}/resolve', [\App\Http\Controllers\Admin\CommentController::class, 'resolveReport'])->name('comments.resolve-report');
    Route::post('/comments/reports/{report}/dismiss', [\App\Http\Controllers\Admin\CommentController::class, 'dismissReport'])->name('comments.dismiss-report');
    Route::post('/comments/{comment}/toggle-visibility', [\App\Http\Controllers\Admin\CommentController::class, 'toggleVisibility'])->name('comments.toggle-visibility');
    Route::delete('/comments/{comment}', [\App\Http\Controllers\Admin\CommentController::class, 'destroy'])->name('comments.destroy');

    Route::post('/upload/image', [\App\Http\Controllers\Admin\UploadController::class, 'image'])->name('upload.image');
    Route::post('/upload/video', [\App\Http\Controllers\Admin\UploadController::class, 'video'])->name('upload.video');

    Route::get('/stats', [\App\Http\Controllers\Admin\StatsController::class, 'index'])->name('stats.index');

    Route::post('/episodes/{episode}/subtitles', [\App\Http\Controllers\SubtitleController::class, 'generate'])->name('episodes.subtitles.generate');
    Route::post('/episodes/{episode}/subtitles/upload', [\App\Http\Controllers\SubtitleController::class, 'store'])->name('episodes.subtitles.upload');
    Route::delete('/subtitles/{subtitle}', [\App\Http\Controllers\SubtitleController::class, 'destroy'])->name('subtitles.destroy');

    Route::get('/support', [\App\Http\Controllers\SupportController::class, 'index'])->name('support.index');
    Route::post('/support/{message}/read', [\App\Http\Controllers\SupportController::class, 'markRead'])->name('support.mark-read');
    Route::delete('/support/{message}', [\App\Http\Controllers\SupportController::class, 'destroy'])->name('support.destroy');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
