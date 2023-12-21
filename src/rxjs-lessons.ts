import { Observable, debounceTime, distinctUntilChanged, fromEvent, map, takeUntil } from "rxjs";

// 1й Способ
/* const search$ = new Observable<Event>(observer => {
    const search = document.getElementById('search');
    const stop = document.getElementById('stop');

    // Если елемент не найден на странице то возвращаем ошибку
    if (!search || !stop) {
        observer.error("Element doesn't exist in page")
        return
    }

    const onSearch = (e: Event) => {
        console.log("Im running from Observable");
        checkSubscription();
        observer.next(e);
    };

    const onStop = (e: Event) => {
        checkSubscription();
        observer.complete(); // остановка передачи потока
        clear(); // отписка
    };

    search?.addEventListener('input', onSearch);
    stop?.addEventListener('click', onStop);

    const checkSubscription = () => {
        if (observer.closed) {
            clear();
        }
    }

    const clear = () => {
        // Отписка от всех слушателей событий
        search.removeEventListener('input', onSearch);
        stop.removeEventListener('click', onStop);
    }
}); */


// 2й Способ

const search$: Observable<Event> = fromEvent<Event>(
    document.getElementById('search')!, // Восклицательный знак говорит что мы уверены в результате
    'input'
);

const stop$: Observable<Event> = fromEvent<Event>(
    document.getElementById('stop')!, // Восклицательный знак говорит что мы уверены в результате
    'click'
);

const stopSubscription = stop$.subscribe(() => {
    searchSubscription.unsubscribe();
    stopSubscription.unsubscribe();
});

// 1st Variant
const searchSubscription = search$.pipe(
    // map видоизменяет обьект которые возвращает next в Observable
    map(e => {
        return (e.target as HTMLInputElement).value;
    }),
    // debounceTime - ставит delay на обработку события subscribe
    debounceTime(500),
    // Делаем проверку на кол-во символов
    map(v => v.length > 3 ? v : ''),
    // distinctUntilChanged - проверяет если предыдущее значение идентично новому то последующий subscribe не происходит
    distinctUntilChanged(),
    // Еще один способ отписаться от потока
    takeUntil(stop$)
    )
    .subscribe(value => {
        console.log(1)
        console.log(value)
});

// 2nd Variant, с помощью такой записи можно отлавливать ошибки
/* search$.subscribe({
    next: value => console.log(value),
    error: e => console.log(e),
    complete: () => console.log('event end'),
}); */

// Отписка от прослушивания через 10 сек(Но слушатель событий все еще работает)
setTimeout(() => {
    console.log("Unsubscribed")
    searchSubscription.unsubscribe()
}, 10000)